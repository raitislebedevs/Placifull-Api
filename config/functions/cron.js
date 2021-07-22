"use strict";

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  // '0 1 * * 1': () => {
  //
  // } ///**********************LISTING CRON_JOBS*************************
  //Removing expired Real estate posts
  "10 4 * * *": async () => {
    try {
      let query = {
        _where: {
          expiryDate_lte: new Date(),
        },
      };

      let entities = await strapi.services["real-estate-listing"].find(query);

      entities.forEach(async (entry) => {
        strapi.services["real-estate-listing"].delete({
          id: entry?.id,
        });

        handleAwsUploadremove(entry);

        let subscription = await strapi.services["subscriptions"].findOne({
          userId: entry.user.id,
        });
        const { realEstate } = subscription;
        if (!realEstate || !realEstate?.listingIds) {
          return;
        }

        handleListingRemoveSubscription(realEstate, "realEstate");
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  //Removing expired transport posts
  "15 4 * * *": async () => {
    try {
      let query = {
        _where: {
          expiryDate_lte: new Date(),
        },
      };

      let entities = await strapi.services["transport-listings"].find(query);

      entities.forEach(async (entry) => {
        strapi.services["transport-listings"].delete({
          id: entry?.id,
        });

        handleAwsUploadremove(entry);

        let subscription = await strapi.services["subscriptions"].findOne({
          userId: entry.user.id,
        });

        const { transport } = subscription;
        if (!transport || !transport?.listingIds) {
          return;
        }

        handleListingRemoveSubscription(transport, "transport");
      });
    } catch (error) {}
  },

  //Removing expired Vacancy posts
  "20 4 * * *": async () => {
    try {
      let query = {
        _where: {
          expiryDate_lte: new Date(),
        },
      };

      let entities = await strapi.services["vacancy-listing"].find(query);

      entities.forEach(async (entry) => {
        strapi.services["vacancy-listing"].delete({
          id: entry?.id,
        });

        handleAwsUploadremove(entry);

        let subscription = await strapi.services["subscriptions"].findOne({
          userId: entry.user.id,
        });
        const { jobs } = subscription;

        if (!jobs || !jobs?.listingIds) {
          return;
        }

        handleListingRemoveSubscription(jobs, "jobs");
      });
    } catch (error) {}
  },

  ///**********************LISTING CRON_JOB END*************************

  "30 4 * * *": async () => {
    try {
      let subscription = await strapi.services["subscriptions"].find();
      subscription.forEach(async (subscription) => {
        const { realEstate, transport, jobs, browserCv, id } = subscription;
        await handleSubscription(realEstate || {}, "realEstate", id);
        await handleSubscription(transport || {}, "transport", id);
        await handleSubscription(jobs || {}, "jobs", id);
        await handleBrowserCv(browserCv || {}, "browserCv", id);
      });
      //console.log(subscription);
    } catch (error) {}
  },
};

async function handleListingRemoveSubscription(component, plan) {
  let listingValus = [];
  let planInUse = {};
  let payload = {};

  planInUse = component.listingIds.filter(
    (listing) => listing?.id == entry?.id
  )[0];

  listingValus = component.listingIds.filter(
    (listing) => listing?.id != entry?.id
  );

  if (
    planInUse.plan === "subscriptionQuarterly" &&
    moment().isAfter(moment(component.subscriptionExpiryQuarterly))
  ) {
    let subscriptionLeft = component.subscriptionQuarterly + 1;
    let subscriptionInUse =
      component.subscriptionQuarterlyInUse - 1 < 0
        ? 0
        : component.subscriptionQuarterlyInUse;
    payload = {
      id: component.id,
      listingIds: listingValus,
      subscriptionQuarterly: subscriptionLeft,
      subscriptionQuarterlyInUse: subscriptionInUse,
    };
  }

  if (
    planInUse.plan === "subscriptionYearly" &&
    moment().isAfter(moment(component.subscriptionExpiryYearly))
  ) {
    let subscriptionLeft = component.subscriptionYearly + 1;
    let subscriptionInUse =
      component.subscriptionYearlyInUse - 1 < 0
        ? 0
        : component.subscriptionYearlyInUse;
    payload = {
      id: component.id,
      listingIds: listingValus,
      subscriptionYearly: subscriptionLeft,
      subscriptionYearlyInUse: subscriptionInUse,
    };
  }

  if (planInUse.plan === "standalone") {
    payload = {
      id: component.id,
      listingIds: listingValus,
    };
  }

  if (listingValus != component?.listingIds) {
    strapi.services["subscriptions"].update(
      { id: subscription.id },
      {
        [plan]: payload,
      }
    );
  }
}

async function handleAwsUploadremove(entry) {
  console.log(entry);
  if (entry?.listingGallery) {
    entry.listingGallery.forEach(async (item) => {
      const file = await strapi.plugins["upload"].services.upload.fetch({
        id: item?.id,
      });
      await strapi.plugins["upload"].services.upload.remove(file);
    });
  }

  if (entry?.componyLogo) {
    const file = await strapi.plugins["upload"].services.upload.fetch({
      id: entry.componyLogo.id,
    });
    await strapi.plugins["upload"].services.upload.remove(file);
  }
}

async function handleSubscription(component, plan, id) {
  if (!component) return;
  let isUpdate = false;
  let subscriptionQuarterly = component?.subscriptionQuarterly;
  let subscriptionYearly = component?.subscriptionYearly;
  let subscriptionExpiryQuarterly = component?.subscriptionExpiryQuarterly;
  let subscriptionExpiryYearly = component?.subscriptionExpiryQuarterly;

  if (
    new Date(subscriptionExpiryQuarterly) < new Date() &&
    subscriptionQuarterly != 0
  ) {
    subscriptionQuarterly = 0;
    isUpdate = true;
  }
  if (
    new Date(subscriptionExpiryYearly) < new Date() &&
    subscriptionYearly != 0
  ) {
    subscriptionYearly = 0;
    isUpdate = true;
  }
  if (isUpdate) {
    await strapi.services["subscriptions"].update(
      { id },
      {
        [plan]: {
          id: component.id,
          subscriptionQuarterly,
          subscriptionYearly,
        },
      }
    );
  }
}

async function handleBrowserCv(component, plan, id) {
  const subscriptionExpiryBrowserCV =
    component?.subscriptionExpiryBrowserCV || new Date();
  const activeSubscription = component?.activeSubscription || false;
  let isUpdate = false;
  let activeCVBrowser = activeSubscription;

  if (
    new Date(subscriptionExpiryBrowserCV) < new Date() &&
    activeSubscription
  ) {
    activeCVBrowser = false;
    isUpdate = true;
  }

  if (isUpdate) {
    await strapi.services["subscriptions"].update(
      { id },
      {
        [plan]: {
          id: component.id,
          activeSubscription: activeCVBrowser,
        },
      }
    );
  }
}
