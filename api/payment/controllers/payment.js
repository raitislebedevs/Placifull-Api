"use strict";

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

module.exports = {
  async chargeCard(ctx) {
    try {
      const { amount, source, receipt_email, description } = ctx.request.body;

      const charge = await stripe.paymentIntents.create({
        amount,
        currency: "eur",
        payment_method: source,
        receipt_email,
        description,
        confirm: true,
      });

      if (!charge) throw new Error("charge unsuccessful");

      ctx.send({
        charged: true,
      });
    } catch (error) {
      ctx.send({
        charged: false,
        message: error,
      });
    }
  },
};
