"use strict";
const stripe = require("stripe")(
  "sk_test_51HYshtLQeXlfqG3xi3WD3orit2IZ1YbsbGb9m7ZaxED2jLuP2Pjxylts039Hj1S5wCnOztry7RnTzY79Wfq0nEFE00vSvuvES3"
);

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
