import { Sequelize, DataTypes } from 'sequelize';
import UpiModel from './unicode';

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
    console.log(
      'Database connection established successfully!!........................................',
    );
    const db = {
      sequelize: sequelize,
      UpiModel: UpiModel(sequelize, DataTypes),
    };

    //await sequelize.sync({ force: true });

    global.DB = db;
  } catch (error) {
    console.error('Unable to connect to database!!!!!!!!!!!!!!!!!!!!!!', error);
  }
};

export default DATABASE;
