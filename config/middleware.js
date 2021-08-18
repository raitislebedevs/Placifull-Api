module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      models: [
        {
          model: "blog",
          maxAge: 18000000,
          cacheTimeout: 300,
        },
        {
          model: "city",
          maxAge: 18000000,
          cacheTimeout: 300,
        },
        {
          model: "country",
          maxAge: 18000000,
          cacheTimeout: 300,
        },
        {
          model: "state",
          maxAge: 18000000,
          cacheTimeout: 300,
        },
        {
          model: "tag",
          maxAge: 18000000,
          cacheTimeout: 300,
        },
        {
          model: "user-suggestions",
          maxAge: 18000000,
          cacheTimeout: 300,
        },
        {
          model: "languages",
          maxAge: 18000000,
          cacheTimeout: 300,
        },
        {
          model: "real-estate-listing",
          maxAge: 180000,
          cacheTimeout: 300,
        },
        {
          model: "transport-listing",
          maxAge: 180000,
          cacheTimeout: 300,
        },
        {
          model: "vacancy-listing",
          maxAge: 180000,
          cacheTimeout: 300,
        },
      ],
    },
  },
});
