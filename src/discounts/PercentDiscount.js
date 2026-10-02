const Discount = require('./Discount');
const AppliedDiscount = require('../models/AppliedDiscount');

class PercentDiscount extends Discount {
    constructor(name, percent) {
        super(name);
        this.percent = percent;
    }

    apply(context) {
        //выбирает меньшее и это меньшее вычитает
        const amount = Math.min(context.currentItemTotal, context.currentItemTotal * this.percent / 100);
        context.currentItemTotal -= amount;

        return new AppliedDiscount(
            this.name,
            amount,
            `${this.percent}% скидка`
        );
    }
}
module.exports = PercentDiscount;
