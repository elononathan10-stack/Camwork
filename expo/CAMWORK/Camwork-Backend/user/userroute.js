import express from "express";
import {
  forgotPassword,
  getAllUsers,
  login,
  register,
  resetPassword,
  checkContent,
} from "./usercontroller.js";

const userrouter = express.Router();
userrouter.post("/register", register);
userrouter.get("/getallusers", getAllUsers);
userrouter.post("/login", login);
userrouter.post("/forgot-password", forgotPassword);
userrouter.post("/reset-password", resetPassword);
userrouter.post("/moderate-content", checkContent);

export default userrouter;
