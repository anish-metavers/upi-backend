import { Model, Sequelize, DataTypes } from 'sequelize';

class Transaction extends Model {}

const model = (sequelize: Sequelize) => {
  Transaction.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      client_upi_id: {
        type: DataTypes.INTEGER,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      client_upi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_upi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      utr: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verify_timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('OPEN', 'PROCESSING', 'FAILED', 'COMPLETED'),
        defaultValue: 'OPEN',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
    },
  );
  return Transaction;
};

export default model;
