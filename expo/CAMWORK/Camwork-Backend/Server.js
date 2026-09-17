import express from "express";
import dotenv from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
dotenv.config();
import { connectToDatabase } from "./dbconnect.js";
import userrouter from "./user/userroute.js";
import paymentrouter from "./payment/paymentroute.js";
import jobrouter from "./job/jobroute.js";
import applicationrouter from "./application/applicationroute.js";
import messagerouter from "./message/messageroute.js";
import directOfferRouter from "./directOffer/directOfferroute.js";
import { sequelize } from "./dbconnect.js";
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "15mb" }));
app.use("/api/user", userrouter);
app.use("/api/payments", paymentrouter);
app.use("/api/jobs", jobrouter);
app.use("/api/applications", applicationrouter);
app.use("/api/messages", messagerouter);
app.use("/api/direct-offers", directOfferRouter);

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "CamWork backend API is active" });
});

const PORT = Number(process.env.PORT || 3000);

const start = async () => {
  await connectToDatabase();
  // Keep schema changes enabled by default so newly deployed escrow fields are
  // created for existing installations. Set DB_SYNC_ALTER=false to disable it
  // when schema changes are managed by an external migration system.
  await sequelize.sync({ alter: process.env.DB_SYNC_ALTER !== "false" });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CamWork API listening on port ${PORT}`);
  });
};

const isMainModule =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  start().catch((error) => {
    console.error("CamWork API could not start:", error);
    process.exit(1);
  });
}

export { app };
