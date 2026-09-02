import express from "express";
import DirectOffer from "./directOffermodel.js";
import Job from "../job/jobmodel.js";
import { requireAuth } from "../middleware/auth.js";
import { hasMeaningfulText } from "../middleware/validation.js";

const directOfferRouter = express.Router();
directOfferRouter.use(requireAuth);

directOfferRouter.get("/", async (req, res) => {
  const where =
    req.query.role === "employer"
      ? { employerEmail: req.auth.email }
      : { seekerEmail: req.auth.email };
  return res.json(
    await DirectOffer.findAll({ where, order: [["createdAt", "DESC"]] }),
  );
});

directOfferRouter.post("/", async (req, res) => {
  const { jobId, seekerEmail, rateOffered, contractType, startDate, message } =
    req.body;
  const job = await Job.findOne({
    where: { id: jobId, ownerEmail: req.auth.email },
  });
  if (!job)
    return res.status(404).json({ error: "Your job offer was not found." });
  if (
    !seekerEmail ||
    !hasMeaningfulText(seekerEmail) ||
    !rateOffered ||
    !contractType ||
    !startDate ||
    !hasMeaningfulText(message)
  )
    return res
      .status(422)
      .json({ error: "Complete the offer with meaningful details." });
  const offer = await DirectOffer.create({
    id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    employerEmail: req.auth.email,
    seekerEmail,
    employerName: job.company,
    companyName: job.company,
    jobId: job.id,
    jobTitle: job.title,
    location: job.location,
    rateOffered,
    contractType,
    startDate,
    message,
    status: "Pending",
  });
  return res.status(201).json(offer);
});

directOfferRouter.patch("/:id/status", async (req, res) => {
  if (!["Accepted", "Declined"].includes(req.body.status))
    return res.status(422).json({ error: "Invalid offer status." });
  const offer = await DirectOffer.findByPk(req.params.id);
  if (!offer) return res.status(404).json({ error: "Offer not found." });
  if (offer.seekerEmail !== req.auth.email)
    return res
      .status(403)
      .json({ error: "Only the worker can respond to this offer." });
  await offer.update({ status: req.body.status });
  return res.json(offer);
});

export default directOfferRouter;
