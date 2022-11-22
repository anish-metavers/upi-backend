import { Model, Sequelize } from 'sequelize';

class ClientUpi extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  ClientUpi.init(
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
      upi: {
        type: DataType.STRING,
        unique: true,
        allowNull: false,
      },
      status: {
        type: DataType.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '1',
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
      modelName: 'ClientUpi',
      tableName: 'client_upi',
    },
  );
  return ClientUpi;
};

export default model;
