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

      if (ctx.query._q) {
        entities = await strapi.services["vacancy-listing"].search(ctx.query);
      } else {
        entities = await strapi.services["vacancy-listing"].find(ctx.query);
      }

      tagEntities = addElementToResults(
        entities,
        polygon,
        limit,
        tagEntities,
        tags,
        start
      );
    } catch (e) {
      console.log(e);
    }

    return tagEntities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models["vacancy-listing"] })
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

      if (ctx.query._q) {
        entities = await strapi.services["vacancy-listing"].search(ctx.query);
      } else {
        entities = await strapi.services["vacancy-listing"].find(ctx.query);
      }

      tagEntities = addElementToResults(
        entities,
        polygon,
        limit,
        tagEntities,
        tags,
        start
      );
    } catch (e) {}

    return tagEntities.length;
  },

  async notifyUser(ctx) {
    let { id } = ctx?.request?.body;
    try {
      //console.log(id);
      if (!id) return [];
      let realEstateItem = await strapi.services["vacancy-listing"].findOne({
        id,
      });
      let realEstateFilters = await strapi.services["vacancy-filter"].find();

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

        if (element?.enLanguages && isMatchingCriteria) {
          isMatchingCriteria = element.enLanguages.some(
            (r) => realEstateItem?.enLanguages.indexOf(r) >= 0
          );
        }

        if (element?.nativeLanguages && isMatchingCriteria) {
          isMatchingCriteria = element.nativeLanguages.some(
            (r) => realEstateItem?.nativeLanguages.indexOf(r) >= 0
          );
        }

        //console.log("Tags", isMatchingCriteria);

        if (element?.currency_id && isMatchingCriteria)
          isMatchingCriteria =
            element.currency_id == realEstateItem?.currency.id;

        //console.log("currency", isMatchingCriteria);

        if (element?.country_id && isMatchingCriteria)
          isMatchingCriteria = element.country_id == realEstateItem?.country.id;

        //console.log("Country", isMatchingCriteria);
        if (element?.state_id && isMatchingCriteria)
          isMatchingCriteria = element.state_id == realEstateItem?.state.id;

        //console.log("State", isMatchingCriteria);
        if (element?.city_id && isMatchingCriteria)
          isMatchingCriteria = element.city_id == realEstateItem?.city.id;

        //console.log("City", isMatchingCriteria);

        if (element?.vacancyOption_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.vacancyOption_contains == realEstateItem?.vacancyOption;

        //console.log("vacancyOption_contains", isMatchingCriteria);
        if (element?.contractType_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.contractType_contains == realEstateItem?.contractType;

        //console.log("contractType_contains", isMatchingCriteria);
        if (element?.workingTime_contains && isMatchingCriteria)
          isMatchingCriteria =
            element.workingTime_contains == realEstateItem?.workingTime;
        //console.log("workingTime_contains", isMatchingCriteria);
        if (element?.annualSalaryFrom_gte && isMatchingCriteria)
          isMatchingCriteria =
            element.annualSalaryFrom_gte <= realEstateItem?.annualSalaryFrom;

        //console.log("annualSalaryFrom_gte", isMatchingCriteria);
        if (element?.annualSalaryTo_lte && isMatchingCriteria)
          isMatchingCriteria =
            element.annualSalaryTo_lte >= realEstateItem?.annualSalaryTo;

        //console.log("annualSalaryTo_lte", isMatchingCriteria);
        if (element?.monthlySalaryFrom_gte && isMatchingCriteria)
          isMatchingCriteria =
            element.monthlySalaryFrom_gte <= realEstateItem?.monthlySalaryFrom;

        //console.log("monthlySalaryFrom_gte", isMatchingCriteria);
        if (element?.monthlySalaryTo_lte && isMatchingCriteria)
          isMatchingCriteria =
            element.monthlySalaryTo_lte >= realEstateItem?.monthlySalaryTo;

        //console.log("monthlySalaryTo_lte", isMatchingCriteria);
        if (element?.hourlySalaryFrom_gte && isMatchingCriteria)
          isMatchingCriteria =
            element.hourlySalaryFrom_gte <= realEstateItem?.hourlySalaryFrom;

        //console.log("hourlySalaryFrom_gte", isMatchingCriteria);
        if (element?.hourlySalaryTo_lte && isMatchingCriteria)
          isMatchingCriteria =
            element.hourlySalaryTo_lte >= realEstateItem?.hourlySalaryTo;

        //console.log("hourlySalaryTo_lte", isMatchingCriteria);

        if (isMatchingCriteria) {
          //console.log("Sending Email");

          await strapi.config.functions["utils"].notifyUserEmail(
            id,
            element.user.email,
            realEstateItem?.companyLogo.url
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
  let enLanguages;
  let nativeLanguages;
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
