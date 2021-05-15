'use strict';
const { sanitizeEntity } = require('strapi-utils');
const data = require('./data');


module.exports = {

  async import(ctx) {
    for (let i = 0; i < data.length; i++) {
      console.log(data[i].nameTag)
      await strapi.query('tag').create(data[i])
    }
    return true;
  },

};
