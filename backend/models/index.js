import { Sequelize } from 'sequelize';
import sqlJsAsSqlite3 from 'sql.js-as-sqlite3';
import fs from 'fs';
import path from 'path';

const isUsingRDS = process.env.RDS_HOSTNAME && process.env.RDS_USERNAME && process.env.RDS_PASSWORD;
const dbType = process.env.DB_TYPE || 'mysql';
const defaultPorts = {
  mysql: 3306,
  postgres: 5432,
};
const defaultPort = defaultPorts[dbType];

export let sequelize;
let saveQueue = Promise.resolve();

if (isUsingRDS) {
  sequelize = new Sequelize({
    database: process.env.RDS_DB_NAME,
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    host: process.env.RDS_HOSTNAME,
    port: process.env.RDS_PORT || defaultPort,
    dialect: dbType,
    logging: false
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    dialectModule: sqlJsAsSqlite3,
    logging: false
  });

  // Save database to file after write operations.
  sequelize.addHook('afterCreate', saveDatabaseToFile);
  sequelize.addHook('afterDestroy', saveDatabaseToFile);
  sequelize.addHook('afterUpdate', saveDatabaseToFile);
  sequelize.addHook('afterSave', saveDatabaseToFile);
  sequelize.addHook('afterUpsert', saveDatabaseToFile);
  sequelize.addHook('afterBulkCreate', saveDatabaseToFile);
  sequelize.addHook('afterBulkDestroy', saveDatabaseToFile);
  sequelize.addHook('afterBulkUpdate', saveDatabaseToFile);
}

export async function saveDatabaseToFile() {
  saveQueue = saveQueue
    .then(async () => {
      const dbInstance = await sequelize.connectionManager.getConnection();
      const binaryArray = dbInstance.database.export();
      const buffer = Buffer.from(binaryArray);
      const databasePath = path.join(process.cwd(), 'database.sqlite');
      const temporaryPath = `${databasePath}.tmp`;

      fs.writeFileSync(temporaryPath, buffer);
      fs.renameSync(temporaryPath, databasePath);
    })
    .catch((err) => {
      console.error('Failed to save database.sqlite:', err);
    });

  return saveQueue;
}
