import { Model, Sequelize, DataTypes } from 'sequelize';

export class User extends Model {
  static associate(models: any) {
    this.hasMany(models.UserUpi, {
      as: 'user_upi_data',
      foreignKey: 'user_id',
      // targetKey: 'user_id',
    });
  }
}

const model = (sequelize: Sequelize) => {
  User.init(
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
      first_name: {
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      // dob: {
      //   type: DataTypes.DATE,
      // },
      // address: {
      //   type: DataTypes.STRING,
      // },
      user_name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      // account_verified: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
      password: {
        type: DataTypes.STRING,
      },
      mobile_number: {
        type: DataTypes.BIGINT,
      },
      // avatar: {
      //   type: DataTypes.STRING,
      //   defaultValue: '/assets/defaultImage.png',
      // },
      // area_code: {
      //   type: DataTypes.STRING,
      // },
      // zip_code: {
      //   type: DataTypes.STRING,
      // },
      // city: {
      //   type: DataTypes.STRING,
      // },
      // country: {
      //   type: DataTypes.STRING,
      // },
      // state: {
      //   type: DataTypes.STRING,
      // },
      // suspension_reason: {
      //   type: DataTypes.STRING,
      // },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'DELETED', 'SUSPENDED'),
        defaultValue: 'ACTIVE',
      },
      // show_online_status: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: true,
      // },
      // show_user_name: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: true,
      // },
      // login_source: {
      //   type: DataTypes.STRING,
      // },
      // unique_uid: {
      //   type: DataTypes.STRING,
      // },
      // uid: {
      //   type: DataTypes.STRING,
      // },
      // preferred_language: {
      //   type: DataTypes.STRING,
      //   defaultValue: 'en',
      // },
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
      modelName: 'User',
      tableName: 'users',
    },
  );
  return User;
};

export default model;
