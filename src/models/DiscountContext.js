class DiscountContext {
    constructor(order, currentItemTotal, currentDeliveryCost, appliedDiscounts, promoInfo) {
        this.order = order;
        this.currentItemTotal = currentItemTotal;
        this.currentDeliveryCost = currentDeliveryCost;
        this.appliedDiscounts = appliedDiscounts;
        this.promoInfo = promoInfo;
    }
}
module.exports = DiscountContext;