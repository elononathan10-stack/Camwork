import { DataTypes } from "sequelize";
import { sequelize } from "../dbconnect.js";

const DirectOffer = sequelize.define("DirectOffer", {
  id: { type: DataTypes.STRING, primaryKey: true },
  employerEmail: { type: DataTypes.STRING, allowNull: false },
  seekerEmail: { type: DataTypes.STRING, allowNull: false },
  employerName: { type: DataTypes.STRING, allowNull: false },
  companyName: { type: DataTypes.STRING, allowNull: false },
  jobId: { type: DataTypes.STRING, allowNull: false },
  jobTitle: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  rateOffered: { type: DataTypes.STRING, allowNull: false },
  contractType: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
});

export default DirectOffer;
