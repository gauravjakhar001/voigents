// ESM export for configuration
export const jwtSecret = process.env.JWT_SECRET || 'change_this_to_env_secret';
export const jwtExpire = process.env.JWT_EXPIRE || '7d';
export const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';
