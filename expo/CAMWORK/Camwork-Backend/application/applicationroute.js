import express from "express";
import Application from "./applicationmodel.js";
import Job from "../job/jobmodel.js";
import { requireAuth } from "../middleware/auth.js";

const applicationrouter = express.Router();
const statuses = ["Pending", "Reviewed", "Interviews", "Accepted", "Rejected"];
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
    if (job.ownerEmail === req.auth.email)
      return res
        .status(403)
        .json({ error: "You cannot apply to your own job posting." });
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
  } catch {
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
    employerValidated: req.body.status === "Accepted",
    employmentStatus: refreshEmploymentStatus({
      ...application.toJSON(),
      status: req.body.status,
      employerValidated: req.body.status === "Accepted",
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

export default applicationrouter;
