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
    let start;
    let polygon = ctx.query?._where?.polygon;
    try {
      let result = createQueryString(ctx, polygon, tags, limit);
      ctx = result.ctx;
      tags = result.tags;
      limit = result.limit;
      start = result.start;
      entities = await strapi.services["transport-listings"].find(ctx.query);

      tagEntities = [];

      addElementToResults(entities, polygon, limit, tagEntities, tags, start);
    } catch (e) {
      console.log(e);
    }

    return tagEntities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models["transport-listings"] })
    );
  },

  async countForm(ctx) {
    let tags;
    let entities;
    let tagEntities = [];
    let limit;
    let start;
    let polygon = ctx.query?._where?.polygon;
    try {
      let result = createQueryString(ctx, polygon, tags, limit);
      ctx = result.ctx;
      tags = result.tags;
      limit = result.limit;
      start = result.start;
      entities = await strapi.services["transport-listings"].find(ctx.query);

      tagEntities = [];
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
      let trasnsportItem = await strapi.services["transport-listings"].findOne({
        id,
      });
      let transportFilters = await strapi.services["transport-filter"].find();

      transportFilters.forEach(async (element) => {
        //console.log(element);
        let isMatchingCriteria = true;

        if (element?.polygon?.length > 0 && isMatchingCriteria) {
          let point = [trasnsportItem?.latitude, trasnsportItem?.longitude];
          isMatchingCriteria = strapi.config.functions["polygon"].contains(
            point,
            element.polygon
          );
        }

        //console.log("Polygon", isMatchingCriteria);

        if (element?.tags && isMatchingCriteria) {
          let listTagId = [];
          trasnsportItem?.tags.map((tag) => {
            listTagId.push(tag.id);
          });

          isMatchingCriteria = element.tags.every((ai) =>
            listTagId.includes(ai)
          );
        }
        //console.log("Tags", isMatchingCriteria);

        if (element?.isPromotable && isMatchingCriteria)
          isMatchingCriteria =
            element.isPromotable == trasnsportItem?.isPromotable;

        //console.log("Promotable", isMatchingCriteria);

        if (element?.currency_id && isMatchingCriteria)
          isMatchingCriteria =
            element.currency_id == trasnsportItem?.currency.id;

        //console.log("currency", isMatchingCriteria);

        if (element?.transportType_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.transportType_contains == trasnsportItem?.transportType;

        //console.log("Category", isMatchingCriteria);
        if (element?.action_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.action_contains == trasnsportItem?.action;

        //console.log("Action", isMatchingCriteria);
        if (element?.condition_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.condition_contains == trasnsportItem?.condition;

        //console.log("Condition", isMatchingCriteria);
        if (element?.engineType_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.engineType_contains == trasnsportItem?.engineType;

        //console.log("Engine Type", isMatchingCriteria);

        if (element?.gearBox_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.gearBox_contains == trasnsportItem?.gearBox;

        //console.log("Gear Box", isMatchingCriteria);

        if (element?.color_contains && isMatchingCriteria)
          isMatchingCriteria = element.color_contains == trasnsportItem?.color;

        //console.log("Color", isMatchingCriteria);

        if (element?.transportBrand_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.transportBrand_contains == trasnsportItem?.transportBrand;

        //console.log("Transport Brand", isMatchingCriteria);

        if (element?.transportModel_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.transportModel_contains == trasnsportItem?.transportModel;

        //console.log("Transport Model", isMatchingCriteria);

        if (element?.distanceMesurment_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.distanceMesurment_contains ==
            trasnsportItem?.distanceMesurment;

        //console.log("Distance Mesrment", isMatchingCriteria);

        if (element?.fuelEconomyMesurment_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.fuelEconomyMesurment_contains ==
            trasnsportItem?.fuelEconomyMesurment;

        //console.log("Fuel messurment", isMatchingCriteria);

        if (element?.country_id && isMatchingCriteria)
          isMatchingCriteria = element.country_id == trasnsportItem?.country.id;

        //console.log("Country", isMatchingCriteria);
        if (element?.state_id && isMatchingCriteria)
          isMatchingCriteria = element.state_id == trasnsportItem?.state.id;

        //console.log("State", isMatchingCriteria);
        if (element?.city_id && isMatchingCriteria)
          isMatchingCriteria = element.city_id == trasnsportItem?.city.id;

        //console.log("City", isMatchingCriteria);

        if (element?.price_gte && isMatchingCriteria)
          isMatchingCriteria = element.price_gte <= trasnsportItem?.price;

        //console.log(element.price_gte);
        //console.log(trasnsportItem?.price);

        //console.log("Price_g", isMatchingCriteria);
        if (element?.price_lte && isMatchingCriteria)
          isMatchingCriteria = element.price_lte >= trasnsportItem?.price;

        //console.log("Price_l", isMatchingCriteria);
        if (element?.fuelEconomy_gte && isMatchingCriteria)
          isMatchingCriteria =
            element.fuelEconomy_gte <= trasnsportItem?.fuelEconomy;

        //console.log("Rooms_G", isMatchingCriteria);
        if (element?.fuelEconomy_lte && isMatchingCriteria)
          isMatchingCriteria =
            element.fuelEconomy_lte >= trasnsportItem?.fuelEconomy;

        //console.log("Rooms_L", isMatchingCriteria);
        if (element?.maxSpeed_gte && isMatchingCriteria)
          isMatchingCriteria = element.maxSpeed_gte <= trasnsportItem?.maxSpeed;

        //console.log("Area_g", isMatchingCriteria);
        if (element?.maxSpeed_lte && isMatchingCriteria)
          isMatchingCriteria = element.maxSpeed_lte >= trasnsportItem?.maxSpeed;

        //console.log("Area_L", isMatchingCriteria);
        if (element?.distance_gte && isMatchingCriteria)
          isMatchingCriteria = element.distance_gte <= trasnsportItem?.distance;

        //console.log("Total_g", isMatchingCriteria);
        if (element?.distance_lte && isMatchingCriteria)
          isMatchingCriteria = element.distance_lte >= trasnsportItem?.distance;

        //console.log("total_L", isMatchingCriteria);

        if (element?.year_gte && isMatchingCriteria)
          isMatchingCriteria = element.year_gte <= trasnsportItem?.year;

        //console.log("year_gte", isMatchingCriteria);

        if (element?.year_lte && isMatchingCriteria)
          isMatchingCriteria = element.year_lte >= trasnsportItem?.year;

        if (isMatchingCriteria) {
          //console.log("Sending Email");

          await strapi.config.functions["utils"].notifyUserEmail(
            id,
            element.user.email,
            trasnsportItem?.listingGallery[0].url
          );
        }
      });
      ctx.send({ ok: true });
    } catch (error) {
      //console.log(error);
    }
  },
};

function createQueryString(ctx, polygon, tags, limit) {
  let start = ctx.query?._start;

  delete ctx.query?._start;
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
  return { ctx, tags, limit, start };
}

function addElementToResults(
  entities,
  polygon,
  limit,
  tagEntities,
  tags,
  start
) {
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

    if (start > 0) {
      start--;
      return;
    }

    if (!tags || result) {
      tagEntities.push(element);
      limit--;
    }
  });

  return tagEntities;
}
