const Discount = require('./Discount');
const AppliedDiscount = require('../models/AppliedDiscount');

class FirstOrder extends Discount {
    constructor(name, percent) {
        super(name);
        this.percent = percent
    }

    apply(context) {
        if (!context.order.customer.isFirstOrder) {
            return null;
        }
        const amount = context.currentItemTotal * this.percent / 100;
        context.currentItemTotal -= amount;

        return new AppliedDiscount(
            this.name,
            amount,
            `Скидка на первый заказ ${this.percent}%`
        );
    }
}
module.exports = FirstOrder;