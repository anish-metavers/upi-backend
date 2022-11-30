import { Model, Sequelize, DataTypes } from 'sequelize';

export class RolePermission extends Model {}

const model = (sequelize: Sequelize) => {
  RolePermission.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      permission_id: {
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
      modelName: 'RolePermission',
      tableName: 'role_permission',
    },
  );
  return RolePermission;
};

export default model;
