"use strict";

const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findForm(ctx) {
    let tags;
    let entities;
    let entitiesExtra = [];
    let tagEntities = [];
    let limit;
    const convertHelper = ctx.query?._where?.convertHelper;
    try {
      if (convertHelper) {
        delete ctx.query._where.convertHelper;
      }

      if (ctx.query?._limit) {
        limit = ctx.query._limit;
        delete ctx.query._limit;
      }

      if (ctx.query?._where?.tags) {
        tags = ctx.query._where.tags;
        delete ctx.query._where.tags;
        ctx.query._where["tags.id_in"] = tags;
      }

      entities = await strapi.services["real-estate-listing"].find(ctx.query);

      if (convertHelper) {
        ctx.query._where.areaMeasurement_contains =
          convertHelper.areaMeasurement;
        ctx.query._where.area_gte =
          convertHelper[convertHelper.areaMeasurement].area_gte;
        ctx.query._where.area_lte =
          convertHelper[convertHelper.areaMeasurement].area_lte;

        entitiesExtra = await strapi.services["real-estate-listing"].find(
          ctx.query
        );
      }

      if (entitiesExtra?.length > 0) {
        entitiesExtra.forEach((extra) => entities.push(extra));
      }

      entities.forEach((element) => {
        if (limit <= 0) throw BreakException;

        let newListId = [];
        element.tags.forEach((tag) => newListId.push(tag?.id));

        var result = tags?.every((val) => {
          return newListId.indexOf(val) >= 0;
        });

        if (!tags) {
          tagEntities.push(element);
          limit--;
        }

        if (result) {
          tagEntities.push(element);
          limit--;
        }
      });
    } catch (e) {}

    return tagEntities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models["real-estate-listing"] })
    );
  },

  async countForm(ctx) {
    let tags;
    let entities;
    let entitiesExtra = [];
    let tagEntities = [];
    let limit;
    const convertHelper = ctx.query?._where?.convertHelper;
    try {
      if (convertHelper) {
        delete ctx.query._where.convertHelper;
      }

      if (ctx.query?._limit) {
        limit = ctx.query._limit;
        delete ctx.query._limit;
      }

      if (ctx.query?._where?.tags) {
        tags = ctx.query._where.tags;
        delete ctx.query._where.tags;
        ctx.query._where["tags.id_in"] = tags;
      }

      entities = await strapi.services["real-estate-listing"].find(ctx.query);
      if (convertHelper) {
        ctx.query._where.areaMeasurement_contains =
          convertHelper.areaMeasurement;
        ctx.query._where.area_gte =
          convertHelper[convertHelper.areaMeasurement].area_gte;
        ctx.query._where.area_lte =
          convertHelper[convertHelper.areaMeasurement].area_lte;
        ctx.query._where;
        entitiesExtra = await strapi.services["real-estate-listing"].find(
          ctx.query
        );
      }

      if (entitiesExtra?.length > 0) {
        entitiesExtra.forEach((extra) => entities.push(extra));
      }

      entities.forEach((element) => {
        if (limit <= 0) throw BreakException;

        let newListId = [];
        element.tags.forEach((tag) => newListId.push(tag?.id));

        var result = tags?.every((val) => {
          return newListId.indexOf(val) >= 0;
        });

        if (!tags) {
          tagEntities.push(element);
          limit--;
        }

        if (result) {
          tagEntities.push(element);
          limit--;
        }
      });
    } catch (e) {}

    return tagEntities.length;
  },
};
