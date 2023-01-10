import { Model, DataTypes } from 'sequelize';

class ClientApi extends Model {}

const model = (sequelize: any) => {
  ClientApi.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      portal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      api_type: {
        type: DataTypes.ENUM('GET_TRANSACTION', 'UPDATE_TRANSACTION'),
        allowNull: false,
      },
      api_method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      api_endpoint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      modelName: 'ClientApi',
      tableName: 'client_apis',
    },
  );
  return ClientApi;
};

export default model;
