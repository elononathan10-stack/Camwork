import { DataTypes } from "sequelize";
import { sequelize } from "../dbconnect.js";

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  payerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  applicationId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "held",
  },
  releasedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Payment;
