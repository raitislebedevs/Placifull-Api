"use strict";

module.exports = {
  async sendEmailToUser(ctx) {
    let { to, from, replyTo, subject, text } = ctx.request.body;
    try {
      // Send an email to the user.
      await strapi.plugins["email"].services.email.send({
        to,
        from,
        replyTo,
        subject,
        text,
      });
    } catch (err) {
      return ctx.badRequest(null, err);
    }

    ctx.send({ ok: true });
  },
};
