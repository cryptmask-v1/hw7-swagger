import { createServer } from './server.js';
import { initMongoDB } from './db/initMongoDB.js';
import { createFileIsNotExist } from './utils/createFileIsNotExist.js';
import { TEMP_FOLDER, UPLOAD_FOLDER } from './constants/index.js';

const bootstrap = async () => {
  await initMongoDB();
  await createFileIsNotExist(UPLOAD_FOLDER);
  await createFileIsNotExist(TEMP_FOLDER);

  createServer();
};

bootstrap();
