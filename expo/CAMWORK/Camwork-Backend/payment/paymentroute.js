import express from "express";
import Payment from "./paymentmodel.js";

const paymentrouter = express.Router();

paymentrouter.post("/", async (req, res) => {
  try {
    const { payerEmail, amount, method } = req.body;
    if (!payerEmail || !amount || !method) {
      return res
        .status(400)
        .json({ error: "payerEmail, amount, and method are required." });
    }
    const payment = await Payment.create({
      payerEmail,
      amount,
      method,
      status: "held",
    });
    return res.status(201).json(payment);
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
