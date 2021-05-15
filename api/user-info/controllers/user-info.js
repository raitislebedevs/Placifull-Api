'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  async updateMe(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }]);
    }

    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services['user-info'].update({ id: user.userInfo }, data, {
        files,
      });
    } else {
      entity = await strapi.services['user-info'].update({ id: user.userInfo }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models['user-info'] });
  },

};
