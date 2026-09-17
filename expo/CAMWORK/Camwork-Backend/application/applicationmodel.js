import { DataTypes } from "sequelize";
import { sequelize } from "../dbconnect.js";

const Application = sequelize.define("Application", {
  id: { type: DataTypes.STRING, primaryKey: true },
  jobId: { type: DataTypes.STRING, allowNull: false },
  applicantEmail: { type: DataTypes.STRING, allowNull: false },
  employerEmail: { type: DataTypes.STRING, allowNull: false },
  jobTitle: { type: DataTypes.STRING, allowNull: false },
  companyName: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  salary: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  coverNote: DataTypes.TEXT,
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
  employerValidated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  seekerValidated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  paymentValidated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  employmentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pending",
  },
  employerCompletionConfirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  seekerCompletionConfirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  paymentId: { type: DataTypes.INTEGER, allowNull: true },
  employerRating: { type: DataTypes.INTEGER, allowNull: true },
  seekerRating: { type: DataTypes.INTEGER, allowNull: true },
  employerReview: { type: DataTypes.TEXT, allowNull: true },
  seekerReview: { type: DataTypes.TEXT, allowNull: true },
  payoutMethod: { type: DataTypes.STRING, allowNull: true },
  payoutAccount: { type: DataTypes.STRING, allowNull: true },
});

export default Application;
