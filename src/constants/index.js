import path from 'path';

export const FIFTEEN_MINUTES = 15 * 60 * 1000; // 15 minutes
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const TEMP_FOLDER = path.join(process.cwd(), 'temp');
export const UPLOAD_FOLDER = path.join(process.cwd(), 'uploads');
