module.exports = ({ env }) => ({
  upload: {
    provider: "aws-s3",
    providerOptions: {
      accessKeyId: env("AWS_ACCESS_KEY_ID"),
      secretAccessKey: env("AWS_ACCESS_SECRET"),
      region: env("AWS_REGION"),
      params: {
        Bucket: env("AWS_BUCKET_NAME"),
      },
    },
  },
  email: {
    provider: "mailgun",
    providerOptions: {
      apiKey: env("MAILGUN_API_KEY"),
      domain: env("MAILGUN_DOMAIN"),
    },
    settings: {
      defaultFrom: env("MAILGUN_DEFAULT_FROM"),
      defaultReplyTo: env("MAILGUN_DEFAULT_REPLY_TO"),
    },
  },
});
