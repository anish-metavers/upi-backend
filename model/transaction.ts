import { Model, Sequelize } from 'sequelize';

class Transaction extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  Transaction.init(
    {
      // Model attributes are defined here
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      client_id: {
        type: DataType.INTEGER,
      },
      order_id: {
        type: DataType.INTEGER,
      },
      amount: {
        type: DataType.INTEGER,
        allowNull: false,
      },
      client_upi_id: {
        type: DataType.STRING,
      },
      user_upi_id: {
        type: DataType.STRING,
      },
      note: {
        type: DataType.INTEGER,
        unique: true,
      },
      utr: {
        type: DataType.STRING,
      },
      verifyTimestamp: {
        type: DataType.DATE,
      },
      endAt: {
        type: DataType.DATE,
      },
      status: {
        type: DataType.ENUM('OPEN', 'VERIFIED', 'COMPLETED', 'EXPIRED'),
        defaultValue: 'OPEN',
      },
      createdAt: {
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataType.DATE,
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
