//результат скидки
class PricingResult {
    constructor(baseTotal, appliedDiscounts, finalTotal) {
        this.baseTotal = baseTotal;
        this.appliedDiscounts = appliedDiscounts;
        this.finalTotal = finalTotal;
    }
}
module.exports = PricingResult;