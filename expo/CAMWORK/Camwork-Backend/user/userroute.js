import express from "express";
import {
  forgotPassword,
  getAllUsers,
  login,
  register,
  resetPassword,
  checkContent,
  searchWorkers,
  submitVerificationDocument,
  updateProfile,
} from "./usercontroller.js";
import { requireAuth } from "../middleware/auth.js";

const userrouter = express.Router();
userrouter.post("/register", register);
userrouter.get("/getallusers", getAllUsers);
userrouter.post("/login", login);
userrouter.post("/forgot-password", forgotPassword);
userrouter.post("/reset-password", resetPassword);
userrouter.post("/moderate-content", checkContent);
userrouter.get("/workers", requireAuth, searchWorkers);
userrouter.patch("/profile", requireAuth, updateProfile);
userrouter.post(
  "/verification/documents",
  requireAuth,
  submitVerificationDocument,
);

export default userrouter;
