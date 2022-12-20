import { Sequelize, DataTypes } from 'sequelize';
import Transaction from './transaction';
import Client from './client';
import ClientUpi from './clientUpi';
import ClientApi from './clientApi';
import Role from './role';
import Permission from './permission';
import RolePermission from './rolePermission';
import UserRole from './userRoles';
import User from './user';
import UserUpi from './userUpi';
import Portal from './portal';
import UserPortal from './userPortal';

const DATABASE = async () => {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_ROOT,
    process.env.DB_PASSWORD,
    {
      host: process.env.HOST,
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
      },
      timezone: '+05:30',
    },
  );

  try {
    await sequelize.authenticate();
    console.log('--------MySQL DB Connected Successfully--------');
    const db = {
      sequelize: sequelize,
      Transaction: Transaction(sequelize),
      Client: Client(sequelize),
      ClientUpi: ClientUpi(sequelize),
      ClientApi: ClientApi(sequelize),
      Role: Role(sequelize),
      Permission: Permission(sequelize),
      RolePermission: RolePermission(sequelize),
      UserRole: UserRole(sequelize),
      User: User(sequelize),
      UserUpi: UserUpi(sequelize),
      Portal: Portal(sequelize),
      UserPortal: UserPortal(sequelize),
    };

    // Setting the association of model
    Object.keys(db).forEach((modelName) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    // await sequelize.sync({ alter: true });

    global.DB = db;
  } catch (error) {
    console.error('--------Error in Connecting to MySQL DB--------', error);
  }
};

export default DATABASE;
