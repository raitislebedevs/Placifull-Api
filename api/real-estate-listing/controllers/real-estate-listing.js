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
    let polygon = ctx.query?._where?.polygon;

    try {
      let result = createQueryString(ctx, polygon, tags, limit);
      ctx = result.ctx;
      tags = result.tags;
      limit = result.limit;

      entities = await strapi.services["real-estate-listing"].find(ctx.query);

      if (convertHelper) {
        ctx = convertMessurement(ctx, convertHelper);

        entitiesExtra = await strapi.services["real-estate-listing"].find(
          ctx.query
        );
      }

      if (entitiesExtra?.length > 0) {
        entitiesExtra.forEach((extra) => entities.push(extra));
      }

      addElementToResults(entities, polygon, limit, tagEntities, tags);
    } catch (e) {
      //console.log(e);
    }

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
    let polygon = ctx.query?._where?.polygon;
    try {
      let result = createQueryString(ctx, polygon, tags, limit);
      ctx = result.ctx;
      tags = result.tags;
      limit = result.limit;

      entities = await strapi.services["real-estate-listing"].find(ctx.query);
      if (convertHelper) {
        ctx = convertMessurement(ctx, convertHelper);

        entitiesExtra = await strapi.services["real-estate-listing"].find(
          ctx.query
        );
      }

      if (entitiesExtra?.length > 0) {
        entitiesExtra.forEach((extra) => entities.push(extra));
      }

      addElementToResults(entities, polygon, limit, tagEntities, tags);
    } catch (e) {
      console.log(e);
    }

    return tagEntities.length;
  },

  async notifyUser(ctx) {
    let { id } = ctx?.request?.body;
    try {
      if (!id) return [];
      let realEstateItem = await strapi.services["real-estate-listing"].findOne(
        { id }
      );
      let realEstateFilters = await strapi.services[
        "real-estate-filter"
      ].find();

      realEstateFilters.forEach(async (element) => {
        //console.log(element);
        let isMatchingCriteria = true;

        if (element?.polygon?.length > 0 && isMatchingCriteria) {
          let point = [realEstateItem?.latitude, realEstateItem?.longitude];
          isMatchingCriteria = strapi.config.functions["polygon"].contains(
            point,
            element.polygon
          );
        }

        //console.log("Polygon", isMatchingCriteria);

        if (element?.tags && isMatchingCriteria) {
          let listTagId = [];
          realEstateItem?.tags.map((tag) => {
            listTagId.push(tag.id);
          });

          isMatchingCriteria = element.tags.every((ai) =>
            listTagId.includes(ai)
          );
        }
        //console.log("Tags", isMatchingCriteria);

        if (element?.currency_id && isMatchingCriteria)
          isMatchingCriteria =
            element.currency_id == realEstateItem?.currency.id;

        //console.log("currency", isMatchingCriteria);

        if (element?.category_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.category_contains == realEstateItem?.category;

        //console.log("Category", isMatchingCriteria);
        if (element?.action_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.action_contains == realEstateItem?.action;

        //console.log("Action", isMatchingCriteria);
        if (element?.condition_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.condition_contains == realEstateItem?.condition;

        //console.log("Condition", isMatchingCriteria);
        if (element?.areaMeasurement_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.areaMeasurement_contains == realEstateItem?.areaMeasurement;

        //console.log("Area messar", isMatchingCriteria);

        if (element?.country_id && isMatchingCriteria)
          isMatchingCriteria = element.country_id == realEstateItem?.country.id;

        //console.log("Country", isMatchingCriteria);
        if (element?.state_id && isMatchingCriteria)
          isMatchingCriteria = element.state_id == realEstateItem?.state.id;

        //console.log("State", isMatchingCriteria);
        if (element?.city_id && isMatchingCriteria)
          isMatchingCriteria = element.city_id == realEstateItem?.city.id;

        //console.log("City", isMatchingCriteria);

        if (element?.price_gte && isMatchingCriteria)
          isMatchingCriteria = element.price_gte <= realEstateItem?.price;

        //console.log(element.price_gte);
        //console.log(realEstateItem?.price);

        //console.log("Price_g", isMatchingCriteria);
        if (element?.price_lte && isMatchingCriteria)
          isMatchingCriteria = element.price_lte >= realEstateItem?.price;

        //console.log("Price_l", isMatchingCriteria);
        if (element?.rooms_gte && isMatchingCriteria)
          isMatchingCriteria = element.rooms_gte <= realEstateItem?.rooms;

        //console.log("Rooms_G", isMatchingCriteria);
        if (element?.rooms_lte && isMatchingCriteria)
          isMatchingCriteria = element.rooms_lte >= realEstateItem?.rooms;

        //console.log("Rooms_L", isMatchingCriteria);
        if (element?.area_gte && isMatchingCriteria)
          isMatchingCriteria = element.area_gte <= realEstateItem?.area;

        //console.log("Area_g", isMatchingCriteria);
        if (element?.area_lte && isMatchingCriteria)
          isMatchingCriteria = element.area_lte >= realEstateItem?.area;

        //console.log("Area_L", isMatchingCriteria);
        if (element?.totalUltilities_gte && isMatchingCriteria)
          isMatchingCriteria =
            element.totalUltilities_gte <= realEstateItem?.totalUltilities;

        //console.log("Total_g", isMatchingCriteria);
        if (element?.totalUltilities_lte && isMatchingCriteria)
          isMatchingCriteria =
            element.totalUltilities_lte >= realEstateItem?.totalUltilities;

        //console.log("total_L", isMatchingCriteria);

        if (element?.inFloor_gte && isMatchingCriteria)
          isMatchingCriteria = element.inFloor_gte <= realEstateItem?.inFloor;

        //console.log("InFlor_g", isMatchingCriteria);
        if (element?.inFloor_lte && isMatchingCriteria)
          isMatchingCriteria = element.inFloor_lte >= realEstateItem?.inFloor;

        //console.log("inFloor_l", isMatchingCriteria);
        if (element?.floors_gte && isMatchingCriteria)
          isMatchingCriteria = element.floors_gte <= realEstateItem?.floors_gte;

        //console.log("floors_g", isMatchingCriteria);
        if (element?.floors_lte && isMatchingCriteria)
          isMatchingCriteria = element.floors_lte >= realEstateItem?.floors_lte;

        //console.log("floors_l", isMatchingCriteria);

        if (element?.yearBuilt_gte && isMatchingCriteria)
          isMatchingCriteria =
            element.yearBuilt_gte <= realEstateItem?.yearBuilt;

        //console.log("yearBuilt_gte", isMatchingCriteria);

        if (element?.yearBuilt_lte && isMatchingCriteria)
          isMatchingCriteria =
            element.yearBuilt_lte >= realEstateItem?.yearBuilt;

        //console.log("yearBuilt_lte", isMatchingCriteria);

        if (element?.moveInDate_gte && isMatchingCriteria)
          isMatchingCriteria =
            element.moveInDate_gte <= realEstateItem?.moveInDate;

        //console.log("moveInDate_gte", isMatchingCriteria);

        if (element?.moveOutDate_lte && isMatchingCriteria)
          isMatchingCriteria =
            element.moveOutDate_lte >= realEstateItem?.moveOutDate;

        //console.log("moveOutDate_lte", isMatchingCriteria);

        if (isMatchingCriteria) {
          //console.log("Sending Email");

          await strapi.config.functions["utils"].notifyUserEmail(
            id,
            element.user.email,
            realEstateItem?.listingGallery[0].url
          );
        }
      });
      ctx.send({ ok: true });
    } catch (error) {
      //console.log(error);
    }
  },
};

function convertMessurement(ctx, convertHelper) {
  ctx.query._where.areaMeasurement_contains = convertHelper.areaMeasurement;
  ctx.query._where.area_gte =
    convertHelper[convertHelper.areaMeasurement].area_gte;
  ctx.query._where.area_lte =
    convertHelper[convertHelper.areaMeasurement].area_lte;

  return ctx;
}

function createQueryString(ctx, polygon, tags, limit) {
  delete ctx.query?._where?.convertHelper;
  delete ctx.query?._where?.polygon;
  if (polygon?.length > 0) {
    polygon = strapi.config.functions["polygon"].convertToNumbers(polygon);
    let borders =
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
  return { ctx, tags, limit };
}

function addElementToResults(entities, polygon, limit, tagEntities, tags) {
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

  return tagEntities;
}
