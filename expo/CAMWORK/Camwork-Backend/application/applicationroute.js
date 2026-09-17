import express from "express";
import Application from "./applicationmodel.js";
import Job from "../job/jobmodel.js";
import Payment from "../payment/paymentmodel.js";
import { requireAuth } from "../middleware/auth.js";

const applicationrouter = express.Router();
const statuses = [
  "Pending",
  "Reviewed",
  "Interviews",
  "Accepted",
  "Funded",
  "In Progress",
  "Completed",
  "Rejected",
];
const refreshEmploymentStatus = (application) => {
  const active =
    application.employerValidated &&
    application.seekerValidated &&
    application.paymentValidated;
  return active
    ? "active"
    : application.status === "Rejected"
      ? "rejected"
      : "pending";
};
applicationrouter.use(requireAuth);

applicationrouter.get("/", async (req, res) => {
  try {
    const applications = await Application.findAll({
      where:
        req.query.role === "employer"
          ? { employerEmail: req.auth.email }
          : { applicantEmail: req.auth.email },
      order: [["createdAt", "DESC"]],
    });
    return res.json(applications);
  } catch {
    return res.status(500).json({ error: "Unable to load applications." });
  }
});

applicationrouter.post("/", async (req, res) => {
  try {
    const job = await Job.findByPk(req.body.jobId);
    if (!job) return res.status(404).json({ error: "Job not found." });
    if (
      String(job.ownerEmail).trim().toLowerCase() ===
      String(req.auth.email).trim().toLowerCase()
    )
      return res
        .status(403)
        .json({ error: "You cannot apply to your own job posting." });
    if (job.status !== "open")
      return res
        .status(409)
        .json({ error: "This job is no longer accepting applications." });
    const existing = await Application.findOne({
      where: { jobId: job.id, applicantEmail: req.auth.email },
    });
    if (existing)
      return res
        .status(409)
        .json({ error: "You already applied to this job." });
    const application = await Application.create({
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      jobId: job.id,
      applicantEmail: req.auth.email,
      employerEmail: job.ownerEmail,
      jobTitle: job.title,
      companyName: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      coverNote: req.body.coverNote,
      status: "Pending",
    });
    return res.status(201).json(application);
  } catch (error) {
    console.error("Unable to submit application:", error);
    return res.status(500).json({ error: "Unable to submit application." });
  }
});

applicationrouter.patch("/:id/status", async (req, res) => {
  if (!statuses.includes(req.body.status))
    return res.status(422).json({ error: "Invalid application status." });
  const application = await Application.findByPk(req.params.id);
  if (!application)
    return res.status(404).json({ error: "Application not found." });
  if (application.employerEmail !== req.auth.email)
    return res
      .status(403)
      .json({ error: "Only the job owner can update this application." });
  await application.update({
    status: req.body.status,
    employerValidated: [
      "Accepted",
      "Funded",
      "In Progress",
      "Completed",
    ].includes(req.body.status),
    employmentStatus: refreshEmploymentStatus({
      ...application.toJSON(),
      status: req.body.status,
      employerValidated: [
        "Accepted",
        "Funded",
        "In Progress",
        "Completed",
      ].includes(req.body.status),
    }),
  });
  return res.json(application);
});

applicationrouter.patch("/:id/validate", async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application)
    return res.status(404).json({ error: "Application not found." });
  if (application.applicantEmail !== req.auth.email)
    return res
      .status(403)
      .json({ error: "Only the applicant can validate this offer." });
  await application.update({
    seekerValidated: Boolean(req.body.validated),
    employmentStatus: refreshEmploymentStatus({
      ...application.toJSON(),
      seekerValidated: Boolean(req.body.validated),
    }),
  });
  return res.json(application);
});

applicationrouter.patch("/:id/completion", async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application)
    return res.status(404).json({ error: "Application not found." });
  const isEmployer = application.employerEmail === req.auth.email;
  const isSeeker = application.applicantEmail === req.auth.email;
  if (!isEmployer && !isSeeker)
    return res.status(403).json({
      error: "Only the employer and applicant can confirm completion.",
    });
  if (
    !["Accepted", "Funded", "In Progress"].includes(application.status) &&
    !application.paymentValidated
  )
    return res.status(409).json({
      error:
        "The employment must be accepted and funded in escrow before completion.",
    });
  if (!application.paymentId && !application.paymentValidated)
    return res
      .status(409)
      .json({ error: "Completion requires an escrow payment." });
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return res.status(422).json({ error: "Please provide a rating from 1 to 5." });
  const review = typeof req.body.review === "string" ? req.body.review.trim() : "";
  const payoutMethod = req.body.payoutMethod;
  const payoutAccount = String(req.body.payoutAccount || "").trim();
  if (isSeeker && (!payoutMethod || !payoutAccount))
    return res.status(422).json({
      error: "Add your payout method and account before confirming completion.",
    });
  const confirmationField = isEmployer
    ? "employerCompletionConfirmed"
    : "seekerCompletionConfirmed";
  if (application[confirmationField]) {
    return res.json({
      application,
      bothConfirmed: application.status === "Completed",
      alreadyConfirmed: true,
    });
  }

  const confirmationUpdate = {
    [confirmationField]: true,
    [isEmployer ? "employerRating" : "seekerRating"]: rating,
    [isEmployer ? "employerReview" : "seekerReview"]: review || null,
    ...(isSeeker ? { payoutMethod, payoutAccount, seekerValidated: true } : { employerValidated: true }),
  };
  const next = { ...application.toJSON(), ...confirmationUpdate };
  const bothConfirmed =
    Boolean(next.employerCompletionConfirmed && next.seekerCompletionConfirmed);
  const transaction = await Application.sequelize.transaction();
  try {
    let payment = null;
    if (application.paymentId) {
      payment = await Payment.findByPk(application.paymentId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
    }
    if (bothConfirmed && payment && payment.status !== "held") {
      await transaction.rollback();
      return res
        .status(409)
        .json({ error: "The escrow payment is no longer held." });
    }
    await application.update(
      {
        ...confirmationUpdate,
        ...(bothConfirmed
          ? {
              status: "Completed",
              employmentStatus: "completed",
              completedAt: new Date(),
            }
          : {
              employmentStatus: "active",
            }),
      },
      { transaction },
    );
    if (bothConfirmed) {
      if (payment) {
        await payment.update(
          { status: "released", releasedAt: new Date() },
          { transaction },
        );
      }
      const job = await Job.findByPk(application.jobId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (job) await job.update({ status: "completed" }, { transaction });
    }
    await transaction.commit();
    const updatedPayment = bothConfirmed && payment ? await Payment.findByPk(payment.id) : payment;
    return res.json({
      application,
      payment: updatedPayment,
      bothConfirmed,
      jobStatus: bothConfirmed ? "completed" : undefined,
    });
  } catch (error) {
    console.error("Completion error:", error);
    await transaction.rollback();
    return res.status(500).json({ error: "Unable to confirm job completion." });
  }
});

export default applicationrouter;
