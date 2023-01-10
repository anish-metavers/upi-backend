import { Model, Sequelize, DataTypes } from 'sequelize';

class UserUpi extends Model {
  static associate(models: any) {
    this.belongsTo(models.ClientUpi, {
      as: 'client_upi_data',
      foreignKey: 'client_upi_id',
      targetKey: 'id',
    });
    this.belongsTo(models.User, {
      as: 'user_data',
      foreignKey: 'user_id',
      targetKey: 'id',
    });
  }
}

const model = (sequelize: Sequelize) => {
  UserUpi.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      client_upi_id: {
        type: DataTypes.INTEGER,
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
      modelName: 'UserUpi',
      tableName: 'user_upis',
    },
  );
  return UserUpi;
};
export default model;
