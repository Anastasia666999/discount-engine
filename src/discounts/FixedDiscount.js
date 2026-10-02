const Discount = require('./Discount');
const AppliedDiscount = require('../models/AppliedDiscount');

class FixedDiscount extends Discount {
    constructor(name, amount, threshold) {
        super(name);
        this.amount = amount;
        this.threshold = threshold;
    }

    apply(context) {
        if (context.currentItemTotal < this.threshold) {
            return null;
        }
        const amount = Math.min(this.amount, context.currentItemTotal);
        context.currentItemTotal -= amount;


        return new AppliedDiscount(
            this.name,
            amount,
            `Скидка ${this.amount}р. при сумме от ${this.threshold}р.`
        )

    };
}
module.exports = FixedDiscount;