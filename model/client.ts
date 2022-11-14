import { Model, Sequelize } from 'sequelize';

class Client extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  Client.init(
    {
      // Model attributes are defined here
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataType.STRING,
        allowNull: false,
      },
      email: {
        type: DataType.STRING,
        allowNull: false,
      },
      password: {
        type: DataType.STRING,
      },
      status: {
        type: DataType.ENUM('0', '1'),
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
      modelName: 'Client',
      tableName: 'clients',
    },
  );
  return Client;
};

export default model;
