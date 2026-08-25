import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectToDatabase } from "./dbconnect.js";
import userrouter from "./user/userroute.js";
import { sequelize } from "./dbconnect.js";
const app = express();

// Enable CORS for mobile and web clients
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use("/api/user", userrouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "CamWork backend API is active" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectToDatabase();
  await sequelize.sync({ force: false, alter: true });
  console.log(`Server is running on port ${PORT}`);
});

