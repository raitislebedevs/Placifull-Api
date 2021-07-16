"use strict";
const { sanitizeEntity } = require("strapi-utils");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async updateCv(ctx) {
    let cv;
    const user = ctx.state.user;

    if (!user?.curriculumVitae) {
      return ctx.badRequest(null, [
        {
          messages: [
            {
              id: "No authorization header was found Or user has not registered Correctly",
            },
          ],
        },
      ]);
    }

    cv = await strapi.services["curriculum-vitaes"].update(
      { id: user?.curriculumVitae },
      ctx.request.body
    );

    return sanitizeEntity(cv, {
      model: strapi.models["curriculum-vitaes"],
    });
  },

  async findForm(ctx) {
    let entities;
    let tagEntities = [];
    let search = {};
    let limit;

    limit = ctx.query?._limit || 10;
    delete ctx.query?._limit;

    search = ctx.query?._search;
    delete ctx.query?._search;

    entities = await strapi.services["curriculum-vitaes"].find(ctx.query);
    tagEntities = getFilteredEntities(entities, search, limit);

    return tagEntities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models["curriculum-vitaes"] })
    );
  },

  async countForm(ctx) {
    return "Hurray!";
  },
};

function salaryComparision(inputSalary, dbSalary) {
  console.log("DB Salary", dbSalary);
  if (dbSalary <= inputSalary || !dbSalary) return true;

  return false;
}

function getFilteredEntities(entities, search, limit) {
  let filteredEntities = [];
  if (!search) return entities;
  try {
    entities?.forEach((cv) => {
      if (limit <= 0) throw BreakException;

      let isExpierience = false;
      let isSeniority = false;
      let isEducation = false;
      let isExpectations = false;
      let isSalary = false;

      if (!search?.seniority) isSeniority = true;
      if (!search?.WorkExpierience) isExpierience = true;
      if (!search?.EducationHistory) isEducation = true;
      if (!search?.WorkExpectations) isExpectations = true;
      if (!search?.salary) isSalary = true;

      if (search?.WorkExpierience) {
        cv?.WorkExpierience.forEach((entry) => {
          if (!isExpierience)
            isExpierience = search.WorkExpierience.includes(
              entry?.employmentSector
            );
        });
      }

      if (search?.seniority) {
        cv?.WorkExpierience.forEach((entry) => {
          if (!isSeniority)
            isSeniority = search.seniority.includes(entry?.seniority);
        });
      }

      if (search?.WorkExpectations) {
        cv?.WorkExpectations.forEach((entry) => {
          if (!isExpectations)
            isExpectations = search.WorkExpectations.includes(
              entry?.vacancyOption
            );
        });
      }

      console.log(search?.salary);
      if (search?.salary) {
        console.log("Expectations", cv.WorkExpectations);
        console.log(cv.WorkExpectations.length);
        if (cv?.WorkExpectations.length === 0) isSalary = true;
        cv?.WorkExpectations.forEach((entry) => {
          if (!isSalary)
            isSalary = salaryComparision(search.salary, entry?.monthly || 0);
        });
      }

      if (search?.EducationHistory) {
        cv?.EducationHistory.forEach((entry) => {
          if (!isEducation) {
            for (
              let index = 0;
              index < entry?.qualificationArea?.length;
              index++
            ) {
              const element = entry?.qualificationArea[index];
              isEducation = search.EducationHistory.includes(element?.value)
                ? true
                : isEducation;
            }
          }
        });
      }

      if (
        isExpierience &&
        isSeniority &&
        isEducation &&
        isExpectations &&
        isSalary
      ) {
        filteredEntities.push(cv);
        limit--;
      }
    });
  } catch (error) {
    if (error !== BreakException) throw e;
  }

  return filteredEntities;
}
