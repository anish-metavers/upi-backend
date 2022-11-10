import { Model, Sequelize } from 'sequelize';

class UpiModel extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  UpiModel.init(
    {
      // Model attributes are defined here
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      amount: {
        type: DataType.INTEGER,
        allowNull: false,
      },
      businessUpiId: {
        type: DataType.STRING,
        allowNull: false,
      },
      userUpiId: {
        type: DataType.STRING,
      },
      orderNumber: {
        type: DataType.INTEGER,
        unique: true,
      },
      utrNumber: {
        type: DataType.STRING,
      },
      status: {
        type: DataType.ENUM('OPEN', 'VERIFIED', 'COMPLETED', 'EXPIRED'),
        defaultValue: 'OPEN',
      },
      verifyTimestamp: {
        type: DataType.DATE,
      },
      endAt: {
        type: DataType.DATE,
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
      modelName: 'UpiModel',
      tableName: 'upi_model',
    },
  );
  return UpiModel;
};

export default model;
