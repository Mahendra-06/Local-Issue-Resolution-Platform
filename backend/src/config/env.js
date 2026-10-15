import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicpulse',
  JWT_SECRET: process.env.JWT_SECRET || 'civicpulse_secure_jwt_secret_production_ready_dev_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  STAFF_INVITE_CODE: process.env.STAFF_INVITE_CODE || 'STAFF-AUTH-2026',
  MANAGER_INVITE_CODE: process.env.MANAGER_INVITE_CODE || 'MGR-AUTH-2026',
};
