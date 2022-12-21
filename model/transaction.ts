import { Model, Sequelize, DataTypes } from 'sequelize';

class Transaction extends Model {
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
    this.belongsTo(models.ClientUpi, {
      as: 'client_upi_data',
      foreignKey: 'client_upi_id',
      targetKey: 'id',
    });
  }
}

const model = (sequelize: Sequelize) => {
  Transaction.init(
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
      client_upi_id: {
        type: DataTypes.INTEGER,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      client_upi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_upi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      utr: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verify_timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('OPEN', 'PROCESSING', 'FAILED', 'COMPLETED'),
        defaultValue: 'OPEN',
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
          fields: ['client_id'],
          unique: false,
        },
        {
          fields: ['client_upi_id'],
          unique: false,
        },
        {
          fields: ['order_id'],
          unique: false,
        },
        {
          fields: ['user_upi'],
          unique: false,
        },
        {
          fields: ['utr'],
          unique: false,
        },
        {
          fields: ['note'],
          unique: false,
        },
        {
          fields: ['amount'],
          unique: false,
        },
      ],
      timestamps: true,
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
    },
  );
  return Transaction;
};

export default model;
