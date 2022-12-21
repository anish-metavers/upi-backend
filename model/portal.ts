import { Model, Sequelize, DataTypes } from 'sequelize';

class Portal extends Model {
  static associate(models: any) {
    this.belongsTo(models.Client, {
      as: 'client_data',
      foreignKey: 'client_id',
      targetKey: 'id',
    });

    this.belongsTo(models.User, {
      as: 'created_by_data',
      foreignKey: 'created_by',
      targetKey: 'id',
    });
  }
}

const model = (sequelize: Sequelize) => {
  Portal.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      redirect_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      indexes: [],
      timestamps: true,
      sequelize,
      modelName: 'Portal',
      tableName: 'portals',
    },
  );
  return Portal;
};

export default model;
