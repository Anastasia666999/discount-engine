const Discount = require('./Discount');
const AppliedDiscount = require('../models/AppliedDiscount');

class FreeDeliveryDiscount extends Discount {
    constructor(name, threshould) {
        super(name);
        this.threshould = threshould
    }

    apply(context) {
        if (context.currentItemTotal <= this.threshould) {
            return null;
        }
        const amount = context.currentDeliveryCost;
        if (amount <= 0) {
            return null;
        }
        context.currentDeliveryCost = 0;

        return new AppliedDiscount(
            this.name,
            amount,
            `Бесплатная доставка при сумме свыше ${this.threshould}`
        );
    }
}
module.exports = FreeDeliveryDiscount;