module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        host: env("DATABASE_HOST", null),
        uri: env("DATABASE_URI", null),
        srv: env.bool("USE_SRV", false),
        port: env.int("DATABASE_PORT", null),
        database: env("DATABASE_NAME", null),
        username: env("DATABASE_USERNAME", null),
        password: env("DATABASE_PASSWORD", null),
      },
      options: {
        authenticationDatabase: env("AUTHENTICATION_DATABASE", "admin"),
        ssl: env.bool("DATABASE_SSL", false),
      },
    },
  },
});
