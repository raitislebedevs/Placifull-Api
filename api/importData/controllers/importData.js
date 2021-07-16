"use strict";
const { sanitizeEntity } = require("strapi-utils");
const data = require("./data");

module.exports = {
  async import(ctx) {
    for (let i = 0; i < data.length; i++) {
      await strapi.query("tag").create(data[i]);
    }
    return true;
  },
};
