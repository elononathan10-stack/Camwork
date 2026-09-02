import express from "express";
import Payment from "./paymentmodel.js";
import Application from "../application/applicationmodel.js";
import { requireAuth } from "../middleware/auth.js";

const paymentrouter = express.Router();

paymentrouter.post("/", requireAuth, async (req, res) => {
  try {
    const { payerEmail, amount, method, applicationId } = req.body;
    if (!payerEmail || !amount || !method) {
      return res
        .status(400)
        .json({ error: "payerEmail, amount, and method are required." });
    }
    if (payerEmail !== req.auth.email)
      return res
        .status(403)
        .json({ error: "The payer must be the signed-in user." });
    const application = applicationId
      ? await Application.findByPk(applicationId)
      : null;
    if (applicationId && !application)
      return res.status(404).json({ error: "Application not found." });
    if (application && application.employerEmail !== req.auth.email)
      return res
        .status(403)
        .json({ error: "Only the employer can fund this employment." });
    const payment = await Payment.create({
      payerEmail: req.auth.email,
      amount,
      method,
      status: "held",
    });
    if (application)
      await application.update({
        paymentValidated: true,
        paymentId: payment.id,
        employmentStatus:
          application.employerValidated && application.seekerValidated
            ? "active"
            : "pending",
      });
    return res.status(201).json({ payment, application });
  } catch (error) {
    return res.status(500).json({ error: "Unable to create payment." });
  }
});

paymentrouter.get("/", async (req, res) => {
  const where = req.query.payerEmail
    ? { payerEmail: req.query.payerEmail }
    : undefined;
  const payments = await Payment.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
  return res.json(payments);
});

export default paymentrouter;
