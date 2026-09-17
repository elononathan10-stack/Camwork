import express from "express";
import Job from "./jobmodel.js";
import { requireAuth } from "../middleware/auth.js";
import {
  hasMeaningfulFields,
  hasMeaningfulText,
} from "../middleware/validation.js";

const jobrouter = express.Router();
const jobStatuses = [
  "open",
  "closed",
  "filled",
  "in-progress",
  "completed",
  "archived",
];
const restrictedContactPattern =
  /(?:\+?\d[\d\s().-]{6,}\d|\b\d{7,}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:meet|meeting|address|whatsapp|telegram|phone|call me|text me|contact me)\b)/i;

const serializeJob = (job) => ({
  ...job.toJSON(),
  postedTime: job.createdAt ? job.createdAt.toISOString() : "Just now",
  matchScore: 0,
  rating: 0,
  reviewCount: 0,
  postedBy: job.ownerEmail,
  postedByRole: job.isServiceRequest ? "seeker" : "employer",
});

const validateJob = (body) => {
  const required = [
    "title",
    "company",
    "location",
    "category",
    "type",
    "salary",
    "description",
  ];
  if (required.some((field) => !String(body[field] || "").trim()))
    return "Title, company, location, category, type, salary, and description are required.";
  if (
    restrictedContactPattern.test(
      required.map((field) => body[field]).join(" "),
    )
  )
    return "Contact details must stay inside CamWork.";
  if (
    !hasMeaningfulFields([
      body.title,
      body.company,
      body.location,
      body.category,
      body.description,
    ])
  )
    return "Please provide meaningful job details.";
  const salary = String(body.salary).trim();
  if (!/^\d[\d\s.,-]*$/.test(salary) && !hasMeaningfulText(salary))
    return "Please provide meaningful job details.";
  if (body.skills && !body.skills.every((skill) => hasMeaningfulText(skill)))
    return "Please provide meaningful skills.";
  return null;
};

jobrouter.get("/", async (_req, res) => {
  try {
    const jobs = await Job.findAll({ order: [["createdAt", "DESC"]] });
    return res.json(jobs.map(serializeJob));
  } catch {
    return res.status(500).json({ error: "Unable to load jobs." });
  }
});

jobrouter.post("/", requireAuth, async (req, res) => {
  const validationError = validateJob(req.body);
  if (validationError) return res.status(422).json({ error: validationError });
  try {
    const job = await Job.create({
      ...req.body,
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ownerEmail: req.auth.email,
      responsibilities: req.body.responsibilities || [],
      requirements: req.body.requirements || [],
      skills: req.body.skills || [],
    });
    return res.status(201).json(serializeJob(job));
  } catch {
    return res.status(500).json({ error: "Unable to create job." });
  }
});

jobrouter.put("/:id", requireAuth, async (req, res) => {
  const validationError = validateJob(req.body);
  if (validationError) return res.status(422).json({ error: validationError });
  const job = await Job.findByPk(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found." });
  if (job.ownerEmail !== req.auth.email)
    return res
      .status(403)
      .json({ error: "You can only edit your own job posts." });
  await job.update(req.body);
  return res.json(serializeJob(job));
});

jobrouter.delete("/:id", requireAuth, async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found." });
  if (job.ownerEmail !== req.auth.email)
    return res
      .status(403)
      .json({ error: "You can only delete your own job posts." });
  await job.destroy();
  return res.status(204).send();
});

jobrouter.patch("/:id/status", requireAuth, async (req, res) => {
  if (!jobStatuses.includes(req.body.status))
    return res.status(422).json({ error: "Invalid job status." });
  const job = await Job.findByPk(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found." });
  if (job.ownerEmail !== req.auth.email)
    return res
      .status(403)
      .json({ error: "You can only update your own job posts." });
  await job.update({ status: req.body.status });
  return res.json(serializeJob(job));
});

export default jobrouter;
