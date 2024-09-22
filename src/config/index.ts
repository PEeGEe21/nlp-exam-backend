import * as dotenv from 'dotenv';
import * as joi from 'joi';

process.env.ENV_PATH
  ? dotenv.config({ path: process.env.ENV_PATH })
  : dotenv.config();

// validating environment variables
const envVarsSchema = joi
  .object({
    PORT: joi.number().default('5000'),
    NODE_ENV: joi
      .string()
      .allow(...['development', 'staging', 'production']),
    DEVELOPMENT_START_COMMAND: joi.string().default('npm run start:dev'),
    LOG_LEVEL: joi
      .string()
      .allow(...['error', 'warning', 'info', 'debug', 'silly', ''])
      .default('silly'),
    JWT_SECRET: joi.string(),
    FRONTEND_URL: joi.string(),

    // database config
    // MONGODB_URI: joi.string().required(),
    DATABASE_LOGGING: joi
      .boolean()
      .truthy('TRUE')
      .truthy('true')
      .falsy('FALSE')
      .falsy('false')
      .default(false),
    // OTP_TTL: joi.number().required().default(600),
    // PASSWORD_RECOVERY_TTL: joi.number().required().default(72),
    // PASSWORD_RECOVERY_EMAIL: joi.string().required(),
    // PASSWORD_RECOVERY_URL: joi.string().required(),
  })
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error}`);
}

export const config = {
  env: envVars.NODE_ENV,
  url: envVars.APP_URL,
  port: envVars.PORT,
  logLevel: envVars.LOG_LEVEL,
  secret: envVars.JWT_SECRET,
  expires: envVars.JWT_EXPIRES_IN,
  feBaseUrl: envVars.FE_BASE_URL,
  db: {
    port: envVars.DATABASE_PORT,
    host: envVars.DATABASE_HOST,
    username: envVars.DATABASE_USERNAME,
    password: envVars.DATABASE_PASSWORD,
    name: envVars.DATABASE_NAME,
    type: envVars.HOST_TYPE,
  },
  // otpTtl: envVars.OTP_TTL,
  frontendUrl: envVars.FRONTEND_URL,
  isDevelopment:
    envVars.NODE_ENV === 'test' || envVars.NODE_ENV === 'development',
};
