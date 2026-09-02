import { DataTypes } from "sequelize";
import { sequelize } from "../dbconnect.js";

const Conversation = sequelize.define("Conversation", {
  id: { type: DataTypes.STRING, primaryKey: true },
  participantOne: { type: DataTypes.STRING, allowNull: false },
  participantTwo: { type: DataTypes.STRING, allowNull: false },
  participantName: { type: DataTypes.STRING, allowNull: false },
  companyName: { type: DataTypes.STRING, allowNull: false },
  jobContext: { type: DataTypes.STRING, allowNull: false },
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "New conversation",
  },
  lastMessageTime: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Just now",
  },
});

export default Conversation;
