import { Model, Sequelize, DataTypes } from 'sequelize';

class UserPortal extends Model {
  static associate(models: any) {
    this.belongsTo(models.Portal, {
      as: 'portal_data',
      foreignKey: 'portal_id',
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
  UserPortal.init(
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
      portal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE',
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
      indexes: [
        {
          unique: true,
          fields: ['portal_id', 'user_id'],
          name: 'portal_id_and_user_id',
        },
      ],
      timestamps: true,
      sequelize,
      modelName: 'UserPortal',
      tableName: 'user_portals',
    },
  );
  return UserPortal;
};
export default model;
