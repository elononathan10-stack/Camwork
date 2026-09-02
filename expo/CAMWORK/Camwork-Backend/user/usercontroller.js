import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "./usermodel.js";
import { requireAuth } from "../middleware/auth.js";
import { Op } from "sequelize";
import { hasMeaningfulText } from "../middleware/validation.js";

const publicUser = (user) => {
  const { password, resetToken, resetTokenExpires, ...safeUser } =
    typeof user.toJSON === "function" ? user.toJSON() : user;
  return safeUser;
};

const restrictedContactPattern =
  /(?:\+?\d[\d\s().-]{6,}\d|\b\d{7,}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:meet|meeting|address|location|come to|whatsapp|telegram|phone|call me|text me|contact me)\b)/i;

export const checkContent = (req, res) => {
  const content = String(req.body?.content || "");
  if (restrictedContactPattern.test(content) || !hasMeaningfulText(content)) {
    return res.status(422).json({
      allowed: false,
      error: "Please enter meaningful content without contact details.",
    });
  }
  return res.status(200).json({ allowed: true });
};

export const searchWorkers = async (req, res) => {
  const query = String(req.query.q || "").trim();
  const where = { role: "seeker" };
  if (query) where.name = { [Op.like]: `%${query}%` };
  const workers = await User.findAll({
    where,
    attributes: [
      "id",
      "name",
      "email",
      "role",
      "avatar",
      "headline",
      "bio",
      "location",
      "expectedRate",
      "skills",
    ],
  });
  return res.json(
    workers.map((worker) => ({
      ...publicUser(worker),
      skills: worker.skills ? JSON.parse(worker.skills) : [],
    })),
  );
};

export const updateProfile = async (req, res) => {
  const allowed = [
    "name",
    "role",
    "avatar",
    "headline",
    "bio",
    "location",
    "expectedRate",
    "skills",
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)),
  );
  if (updates.role) {
    const role = String(updates.role).toLowerCase();
    if (!['seeker', 'employer'].includes(role)) {
      return res.status(422).json({ error: "Invalid account role." });
    }
    updates.role = role;
  }
  if (updates.skills) updates.skills = JSON.stringify(updates.skills);
  const user = await User.findOne({ where: { email: req.auth.email } });
  if (!user) return res.status(404).json({ error: "Account not found." });
  await user.update(updates);
  const profile = publicUser(user);
  return res.json({
    ...profile,
    skills: profile.skills ? JSON.parse(profile.skills) : [],
  });
};

export const submitVerificationDocument = async (req, res) => {
  const { documentType, fileName, mimeType, data } = req.body;
  if (!documentType || !fileName || !mimeType || !data)
    return res.status(400).json({
      error: "documentType, fileName, mimeType, and data are required.",
    });
  const payload = { documentType, fileName, mimeType, data };
  let providerStatus = "pending_manual_review";
  if (process.env.KYC_API_URL) {
    const response = await fetch(process.env.KYC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.KYC_API_KEY
          ? { Authorization: `Bearer ${process.env.KYC_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      return res
        .status(502)
        .json({ error: "KYC provider rejected the document." });
    providerStatus = "submitted_to_kyc";
  }
  return res
    .status(202)
    .json({ status: providerStatus, documentType, fileName });
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

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || "camwork-secret",
      { expiresIn: "6h" },
    );

    res.status(201).json({ ...publicUser(newUser), token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users.map(publicUser));
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

    res.status(200).json({ user: publicUser(user), token });
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
