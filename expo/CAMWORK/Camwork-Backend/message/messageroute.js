import express from "express";
import { Op } from "sequelize";
import Conversation from "./conversationmodel.js";
import Message from "./messagemodel.js";
import User from "../user/usermodel.js";
import { requireAuth } from "../middleware/auth.js";

const messagerouter = express.Router();
messagerouter.use(requireAuth);

messagerouter.get("/", async (req, res) => {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [
        { participantOne: req.auth.email },
        { participantTwo: req.auth.email },
      ],
    },
    order: [["updatedAt", "DESC"]],
  });
  const result = await Promise.all(
    conversations.map(async (conversation) => ({
      id: conversation.id,
      employerName: conversation.participantName,
      companyName: conversation.companyName,
      jobContext: conversation.jobContext,
      lastMessage: conversation.lastMessage,
      lastMessageTime: conversation.lastMessageTime,
      unreadCount: 0,
      isOnline: false,
      messages: (
        await Message.findAll({
          where: { conversationId: conversation.id },
          order: [["createdAt", "ASC"]],
        })
      ).map((message) => ({
        id: message.id,
        senderId: message.senderEmail,
        text: message.text,
        timestamp: message.createdAt?.toISOString() || "Just now",
        isMe: message.senderEmail === req.auth.email,
      })),
    })),
  );
  return res.json(result);
});

messagerouter.post("/", async (req, res) => {
  const { recipientEmail, recipientName, companyName, jobContext } = req.body;
  if (!recipientEmail || !recipientName || !companyName || !jobContext)
    return res
      .status(400)
      .json({ error: "Conversation details are required." });
  const normalizedRecipient = String(recipientEmail).trim().toLowerCase();
  if (normalizedRecipient === req.auth.email)
    return res.status(422).json({ error: "You cannot start a chat with yourself." });
  const recipient = await User.findOne({ where: { email: normalizedRecipient } });
  if (!recipient) return res.status(404).json({ error: "Recipient account not found." });

  // A job should have one shared thread per pair of users. This makes the
  // employer's chat open on both phones instead of creating local duplicates.
  const existing = await Conversation.findOne({
    where: {
      jobContext,
      [Op.or]: [
        { participantOne: req.auth.email, participantTwo: normalizedRecipient },
        { participantOne: normalizedRecipient, participantTwo: req.auth.email },
      ],
    },
  });
  if (existing) return res.json(existing);
  const conversation = await Conversation.create({
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    participantOne: req.auth.email,
    participantTwo: normalizedRecipient,
    participantName: recipientName,
    companyName,
    jobContext,
  });
  return res.status(201).json(conversation);
});

messagerouter.post("/:id/messages", async (req, res) => {
  const conversation = await Conversation.findByPk(req.params.id);
  if (!conversation)
    return res.status(404).json({ error: "Conversation not found." });
  if (
    ![conversation.participantOne, conversation.participantTwo].includes(
      req.auth.email,
    )
  )
    return res
      .status(403)
      .json({ error: "You are not part of this conversation." });
  if (!String(req.body.text || "").trim())
    return res.status(400).json({ error: "Message text is required." });
  const message = await Message.create({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversationId: conversation.id,
    senderEmail: req.auth.email,
    text: req.body.text.trim(),
  });
  await conversation.update({
    lastMessage: message.text,
    lastMessageTime: "Just now",
  });
  return res.status(201).json(message);
});

export default messagerouter;
