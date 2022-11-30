import { Model, Sequelize, DataTypes } from 'sequelize';

class UserRole extends Model {
  static associate(models: any) {
    this.belongsTo(models.Role, {
      as: 'role_data',
      foreignKey: 'role_id',
      targetKey: 'id',
    });
  }
}

const model = (sequelize: Sequelize) => {
  UserRole.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
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
      modelName: 'UserRole',
      tableName: 'user_roles',
    },
  );
  return UserRole;
};

export default model;
