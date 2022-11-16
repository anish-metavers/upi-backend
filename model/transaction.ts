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
        allowNull: false,
      },
      client_upi_id: {
        type: DataType.INTEGER,
      },
      order_id: {
        type: DataType.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataType.INTEGER,
        allowNull: false,
      },
      client_upi: {
        type: DataType.STRING,
      },
      user_upi: {
        type: DataType.STRING,
      },
      note: {
        type: DataType.STRING,
      },
      utr: {
        type: DataType.STRING,
        allowNull: false,
      },
      verify_timestamp: {
        type: DataType.DATE,
      },
      end_at: {
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
