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
    let polygon = ctx.query?._where?.polygon;
    let borders;
    try {
      delete ctx.query?._where?.polygon;
      if (polygon?.length > 0) {
        polygon = strapi.config.functions["polygon"].convertToNumbers(polygon);
        borders =
          strapi.config.functions["polygon"].getMaxMinCoordinates(polygon);

        ctx.query._where["longitude_lte"] = borders.maxValue.lng;
        ctx.query._where["latitude_lte"] = borders.maxValue.lat;
        ctx.query._where["longitude_gte"] = borders.minValue.lng;
        ctx.query._where["latitude_gte"] = borders.minValue.lat;
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
      entities = await strapi.services["transport-listings"].find(ctx.query);

      tagEntities = [];

      entities.forEach((element) => {
        if (limit <= 0) throw "Found all items";
        if (polygon?.length > 0) {
          let point = [element?.latitude, element?.longitude];
          let inPolygon = strapi.config.functions["polygon"].contains(
            point,
            polygon
          );
          if (!inPolygon) {
            return;
          }
        }

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
      sanitizeEntity(entity, { model: strapi.models["transport-listings"] })
    );
  },

  async countForm(ctx) {
    let tags;
    let entities;
    let tagEntities = [];
    let limit;
    let polygon = ctx.query?._where?.polygon;
    try {
      delete ctx.query?._where?.polygon;
      if (polygon?.length > 0) {
        polygon = strapi.config.functions["polygon"].convertToNumbers(polygon);
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

      entities = await strapi.services["transport-listings"].find(ctx.query);

      tagEntities = [];
      entities.forEach((element) => {
        if (limit <= 0) throw "Found all items";
        if (polygon?.length > 0) {
          let point = [element?.latitude, element?.longitude];
          let inPolygon = strapi.config.functions["polygon"].contains(
            point,
            polygon
          );
          if (!inPolygon) {
            return;
          }
        }

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
