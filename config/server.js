module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "61997a0fcbda877ca4cee9ad33abd1a3"),
    },
  },
  cron: {
    enabled: true,
  },
  url: env("HEROKU_URL", "http://localhost:8080"),
});
