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
    let tagEntities = [];
    let limit;
    let enLanguages;
    let nativeLanguages;
    if (ctx.query?._limit) {
      limit = ctx.query._limit;
      delete ctx.query._limit;
    }

    if (ctx.query?._where?.tags) {
      tags = ctx.query._where.tags;
      delete ctx.query._where.tags;
      ctx.query._where["tags.id_in"] = tags;
    }

    if (ctx.query?._where?.nativeLanguages) {
      nativeLanguages = ctx.query._where.nativeLanguages;
      delete ctx.query._where.nativeLanguages;
      ctx.query._where["nativeLanguages_in"] = nativeLanguages;
    }

    if (ctx.query?._where?.enLanguages) {
      enLanguages = ctx.query._where.enLanguages;
      delete ctx.query._where.enLanguages;
      ctx.query._where["enLanguages_in"] = enLanguages;
    }

    if (ctx.query._q) {
      entities = await strapi.services["vacancy-listing"].search(ctx.query);
    } else {
      entities = await strapi.services["vacancy-listing"].find(ctx.query);
    }

    tagEntities = [];
    try {
      entities.forEach((element) => {
        if (limit <= 0) throw BreakException;

        let newListId = [];
        element.tags?.forEach((tag) => newListId.push(tag?.id));

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
      sanitizeEntity(entity, { model: strapi.models["vacancy-listing"] })
    );
  },

  async countForm(ctx) {
    let tags;
    let entities;
    let tagEntities = [];
    let limit;
    if (ctx.query?._limit) {
      limit = ctx.query._limit;
      delete ctx.query._limit;
    }

    if (ctx.query?._where?.tags) {
      tags = ctx.query._where.tags;
      delete ctx.query._where.tags;
      ctx.query._where["tags.id_in"] = tags;
    }

    if (ctx.query._q) {
      entities = await strapi.services["vacancy-listing"].search(ctx.query);
    } else {
      entities = await strapi.services["vacancy-listing"].find(ctx.query);
    }

    tagEntities = [];
    try {
      entities.forEach((element) => {
        if (limit <= 0) throw BreakException;

        let newListId = [];
        element.tags?.forEach((tag) => newListId.push(tag?.id));

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
