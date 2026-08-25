import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "./usermodel.js";

const restrictedContactPattern =
  /(?:\+?\d[\d\s().-]{6,}\d|\b\d{7,}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:meet|meeting|address|location|come to|whatsapp|telegram|phone|call me|text me|contact me)\b)/i;

export const checkContent = (req, res) => {
  const content = String(req.body?.content || "");
  if (restrictedContactPattern.test(content)) {
    return res.status(422).json({
      allowed: false,
      error: "Contact details and meeting arrangements must stay on CamWork.",
    });
  }
  return res.status(200).json({ allowed: true });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const findEmail = await User.findOne({
      where: { email: normalizedEmail },
    });
    if (findEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "USER",
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "camwork-secret",
      { expiresIn: "6h" },
    );

    res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account was found with that email." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    return res.status(200).json({
      message: "Password reset instructions have been sent to your email.",
      resetToken,
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res
      .status(500)
      .json({ error: "Failed to process password reset request." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Reset token and new password are required" });
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    if (new Date(user.resetTokenExpires) < new Date()) {
      user.resetToken = null;
      user.resetTokenExpires = null;
      await user.save();
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ error: "Failed to reset password." });
  }
};
