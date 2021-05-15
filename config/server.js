module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "b3f8b08970bd441ca49b1ad6a989851c"),
    },
  },
  url: env("", "http://localhost:8888"),
});
