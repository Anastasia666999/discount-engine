const Discount = require("./Discount");
const AppliedDiscount = require("../models/AppliedDiscount");

class LoyaltyDiscount extends Discount {
    constructor(name, percent, days) { super(name); this.percent = percent; this.days = days; }

    apply(context) {
        if (!context.order.customer.lastPurchaseDate) {
            return null;
        }

        const lastPurchase = new Date(
            context.order.customer.lastPurchaseDate
        );

        const createdAt = new Date(
            context.order.createdAt
        );

        const difference = createdAt - lastPurchase;

        //перевод миллисекунд в дни
        const daysPassed =
            difference / (1000 * 60 * 60 * 24);

        if (daysPassed < 0 || daysPassed > this.days) {
            return null;
        }

        const amount =
            context.currentItemTotal *
            this.percent /
            100;

        context.currentItemTotal -= amount;

        return new AppliedDiscount(
            this.name,
            amount,
            `Скидка за лояльность ${this.percent}%`
        );
    }
}
module.exports = LoyaltyDiscount;