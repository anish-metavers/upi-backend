import { Model, Sequelize, DataTypes } from 'sequelize';

class ClientUpi extends Model {
  static associate(models: any) {
    this.belongsTo(models.Client, {
      as: 'client_data',
      foreignKey: 'client_id',
      targetKey: 'id',
    });

    this.belongsTo(models.Portal, {
      as: 'portal_data',
      foreignKey: 'portal_id',
      targetKey: 'id',
    });
  }
}

const model = (sequelize: Sequelize) => {
  ClientUpi.init(
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
      portal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      upi: {
        type: DataTypes.STRING,
        unique: true,
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
      modelName: 'ClientUpi',
      tableName: 'client_upis',
    },
  );
  return ClientUpi;
};

export default model;
