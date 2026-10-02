const Discount = require('./Discount');
const AppliedDiscount = require('../models/AppliedDiscount');

class ThreeForTwoDiscount extends Discount {
    constructor(name, category) {
        super(name),
            this.category = category;
    }

    apply(context) {
        const items = context.order.items.filter(item => item.product.category === this.category);
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const freeQuantity = Math.floor(totalQuantity / 3);

        const prices = [];
        for (const item of items) {
            for (let i = 0; i < item.quantity; i++) {
                prices.push(item.product.basePrice);
            }
        }
        //от меньшего к большему
        prices.sort((a, b) => a - b);

        const discountAmount = prices.slice(0, freeQuantity).reduce((sum, price) => sum + price, 0);

        if (discountAmount <= 0) {
            return null;
        }
        context.currentItemTotal -= discountAmount;

        return new AppliedDiscount(
            this.name,
            discountAmount,
            `3 по цене 2 для категории ${this.category}`
        );
    }
}
module.exports = ThreeForTwoDiscount;