import fs from 'fs/promises';

export const createFileIsNotExist = async (filePath) => {
  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(filePath);
      console.log('Directory created:', filePath);
      return true; // Directory created
    }
  }
};
