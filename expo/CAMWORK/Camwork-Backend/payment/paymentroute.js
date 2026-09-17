import express from "express";
import { Op } from "sequelize";
import Payment from "./paymentmodel.js";
import Application from "../application/applicationmodel.js";
import { requireAuth } from "../middleware/auth.js";
import { sequelize } from "../dbconnect.js";

const paymentrouter = express.Router();
const paymentMethods = ["mtn-mobile-money", "orange-money", "card"];
const escrowAmountFromSalary = (salary) => {
  const firstAmount = String(salary || "").match(/\d[\d\s,]*/)?.[0];
  return Number(String(firstAmount || "").replace(/[^0-9]/g, ""));
};

paymentrouter.post("/", requireAuth, async (req, res) => {
  try {
    const { payerEmail, amount, method, applicationId, notes } = req.body;
    if (!payerEmail || !amount || !method) {
      return res
        .status(400)
        .json({ error: "payerEmail, amount, and method are required." });
    }
    if (!paymentMethods.includes(method)) {
      return res
        .status(422)
        .json({ error: "Choose MTN Mobile Money, Orange Money, or card." });
    }

    // Sanitize numeric amount by stripping non-numeric formatting (commas, currency text)
    const sanitizedAmountStr = String(amount).replace(/[^0-9.]/g, "");
    const numericAmount = Number(sanitizedAmountStr);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res
        .status(422)
        .json({ error: "Payment amount must be greater than zero." });
    }

    if (
      String(payerEmail).trim().toLowerCase() !==
      String(req.auth.email).trim().toLowerCase()
    ) {
      return res
        .status(403)
        .json({ error: "The payer must be the signed-in user." });
    }

    let application = null;
    if (applicationId) {
      application = await Application.findByPk(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found." });
      }
      if (
        String(application.employerEmail).trim().toLowerCase() !==
        String(req.auth.email).trim().toLowerCase()
      ) {
        return res
          .status(403)
          .json({ error: "Only the employer can fund this employment." });
      }
      if (application.paymentValidated) {
        return res
          .status(409)
          .json({ error: "This employment has already been funded." });
      }
      const offeredAmount = escrowAmountFromSalary(application.salary);
      if (!offeredAmount || numericAmount !== offeredAmount) {
        return res.status(422).json({
          error:
            "The escrow deposit must match the compensation stated in the job offer.",
        });
      }
    }

    const transaction = await sequelize.transaction();
    let payment;
    try {
      payment = await Payment.create(
        {
          payerEmail: req.auth.email,
          amount: numericAmount,
          method,
          applicationId: application ? application.id : null,
          status: "held",
        },
        { transaction },
      );

      if (application) {
        await application.update(
          {
            paymentValidated: true,
            paymentId: payment.id,
            status: "Funded",
            employerValidated: true,
            employmentStatus: application.seekerValidated
              ? "active"
              : "pending",
          },
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    // Fetch enriched payment data to return
    const enrichedPayment = {
      ...payment.toJSON(),
      jobTitle: application?.jobTitle,
      companyName: application?.companyName,
      applicantEmail: application?.applicantEmail,
    };

    return res.status(201).json({ payment: enrichedPayment, application });
  } catch (error) {
    console.error("Unable to create payment:", error);
    return res.status(500).json({ error: "Unable to create payment." });
  }
});

paymentrouter.get("/", requireAuth, async (req, res) => {
  try {
    const userEmail = req.auth.email;

    // Find all applications where the user is either the employer or the applicant
    const userApplications = await Application.findAll({
      where: {
        [Op.or]: [
          { employerEmail: userEmail },
          { applicantEmail: userEmail },
        ],
      },
      attributes: ["id", "jobTitle", "companyName", "applicantEmail", "employerEmail", "salary", "status"],
    });

    const appMap = new Map();
    const appIds = [];
    userApplications.forEach((app) => {
      appMap.set(app.id, app);
      appIds.push(app.id);
    });

    // Find payments either made by the user OR attached to user's applications
    const payments = await Payment.findAll({
      where: {
        [Op.or]: [
          { payerEmail: userEmail },
          ...(appIds.length > 0 ? [{ applicationId: { [Op.in]: appIds } }] : []),
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    // Enrich payment items with application details
    const enrichedPayments = payments.map((payment) => {
      const app = payment.applicationId ? appMap.get(payment.applicationId) : null;
      return {
        ...payment.toJSON(),
        jobTitle: app?.jobTitle || "Direct Escrow Payment",
        companyName: app?.companyName || "CamWork Service",
        applicantEmail: app?.applicantEmail || null,
        employerEmail: app?.employerEmail || payment.payerEmail,
      };
    });

    return res.json(enrichedPayments);
  } catch (error) {
    console.error("Unable to load payments:", error);
    return res.status(500).json({ error: "Unable to load payments." });
  }
});

paymentrouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found." });
    const application = payment.applicationId
      ? await Application.findByPk(payment.applicationId)
      : null;
    if (
      payment.payerEmail !== req.auth.email &&
      application?.applicantEmail !== req.auth.email
    ) {
      return res.status(403).json({ error: "You cannot view this payment." });
    }
    return res.json({
      ...payment.toJSON(),
      jobTitle: application?.jobTitle,
      companyName: application?.companyName,
      applicantEmail: application?.applicantEmail,
    });
  } catch (error) {
    console.error("Unable to load payment:", error);
    return res.status(500).json({ error: "Unable to load payment." });
  }
});

export default paymentrouter;
