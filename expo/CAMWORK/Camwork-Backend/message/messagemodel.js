import { DataTypes } from "sequelize";
import { sequelize } from "../dbconnect.js";

const Message = sequelize.define("Message", {
  id: { type: DataTypes.STRING, primaryKey: true },
  conversationId: { type: DataTypes.STRING, allowNull: false },
  senderEmail: { type: DataTypes.STRING, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
});

export default Message;
