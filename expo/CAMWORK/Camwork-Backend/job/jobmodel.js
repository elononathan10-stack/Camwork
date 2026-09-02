import { DataTypes } from "sequelize";
import { sequelize } from "../dbconnect.js";

const Job = sequelize.define("Job", {
  id: { type: DataTypes.STRING, primaryKey: true },
  ownerEmail: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  contractDuration: DataTypes.STRING,
  salary: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  responsibilities: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  requirements: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  skills: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  isServiceRequest: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  employerVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "open" },
});

export default Job;
