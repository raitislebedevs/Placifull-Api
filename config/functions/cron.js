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

        handleListingRemoveSubscription(
          realEstate,
          "realEstate",
          entry.id,
          subscription.id
        );
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

        handleAwsUploadremove(entry, entry.id);

        let subscription = await strapi.services["subscriptions"].findOne({
          userId: entry.user.id,
        });

        const { transport } = subscription;
        if (!transport || !transport?.listingIds) {
          return;
        }

        handleListingRemoveSubscription(
          transport,
          "transport",
          entry.id,
          subscription.id
        );
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

        handleListingRemoveSubscription(
          jobs,
          "jobs",
          entry.id,
          subscription.id
        );
      });
    } catch (error) {}
  },

  ///**********************LISTING CRON_JOB END*************************

  "25 4 * * *": async () => {
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

async function handleListingRemoveSubscription(
  component,
  plan,
  entryId,
  subsId
) {
  let listingValus = [];
  let planInUse = {};
  let payload = {};

  planInUse = component.listingIds.filter(
    (listing) => listing?.id == entryId
  )[0];

  listingValus = component.listingIds.filter(
    (listing) => listing?.id != entryId
  );

  if (
    planInUse.plan === "subscriptionQuarterly" &&
    compareDates(component.subscriptionExpiryQuarterly)
  ) {
    let subscriptionInUse =
      component.subscriptionQuarterlyInUse - 1 < 0
        ? 0
        : component.subscriptionQuarterlyInUse - 1;
    payload = {
      id: component.id,
      listingIds: listingValus,
      subscriptionQuarterlyInUse: subscriptionInUse,
    };
  }

  if (
    planInUse.plan === "subscriptionYearly" &&
    compareDates(component.subscriptionExpiryYearly)
  ) {
    let subscriptionInUse =
      component.subscriptionYearlyInUse - 1 < 0
        ? 0
        : component.subscriptionYearlyInUse - 1;
    payload = {
      id: component.id,
      listingIds: listingValus,
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
      { id: subsId },
      {
        [plan]: payload,
      }
    );
  }
}

function compareDates(date) {
  let currentDate = new Date();
  let subscriptionDate = new Date(date);
  if (currentDate.getTime() < subscriptionDate.getTime()) {
    return true;
  }

  return false;
}

async function handleAwsUploadremove(entry) {
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
