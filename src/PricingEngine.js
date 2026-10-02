const DiscountContext = require("./models/DiscountContext");
const PricingResult = require("./models/PricingResult");
const roundMoney = require("./utils/roundMoney");

class PricingEngine {
    constructor(discounts) {
         this.discounts = discounts; }

    calculate(order) {
        const baseItemTotal = order.items.reduce(
            (sum, item) => sum + item.product.basePrice * item.quantity,
            0
        );

        const context = new DiscountContext(
            order,
            baseItemTotal,
            order.deliveryCost,
            [],
            null
        );

        const discounts = this.discounts
            .map((discount, index) => ({
                discount,
                index
            }))
            .sort((a, b) => {
                if (a.discount.stage !== b.discount.stage) {
                    return a.discount.stage - b.discount.stage;
                }

                return a.index - b.index;
            })
            .map(item => item.discount);

        const processedConflictGroups = new Set();

        for (const discount of discounts) {

            if (discount.conflictGroup) {

                if (processedConflictGroups.has(discount.conflictGroup)) {
                    continue;
                }

                const candidates = discounts.filter(
                    item =>
                        item.conflictGroup === discount.conflictGroup
                );

                let bestDiscount = null;
                let bestAmount = 0;
                let bestPriority = -1;

                for (const candidate of candidates) {
                    const testContext = new DiscountContext(
                        order,
                        context.currentItemTotal,
                        context.currentDeliveryCost,
                        [],
                        null
                    );

                    const appliedDiscount =
                        candidate.apply(testContext);

                    if (
                        !appliedDiscount ||
                        appliedDiscount.amount <= 0
                    ) {
                        continue;
                    }

                    if (
                        appliedDiscount.amount > bestAmount ||
                        (
                            appliedDiscount.amount === bestAmount &&
                            candidate.conflictPriority > bestPriority
                        )
                    ) {
                        bestDiscount = candidate;
                        bestAmount = appliedDiscount.amount;
                        bestPriority =
                            candidate.conflictPriority;
                    }
                }

                if (bestDiscount) {
                    const appliedDiscount =
                        bestDiscount.apply(context);

                    if (
                        appliedDiscount &&
                        appliedDiscount.amount > 0
                    ) {
                        appliedDiscount.amount =
                            roundMoney(appliedDiscount.amount);

                        context.currentItemTotal =
                            roundMoney(
                                context.currentItemTotal
                            );

                        context.appliedDiscounts.push(
                            appliedDiscount
                        );
                    }
                }

                processedConflictGroups.add(
                    discount.conflictGroup
                );

                continue;
            }

            const appliedDiscount =
                discount.apply(context);

            if (
                appliedDiscount &&
                appliedDiscount.amount > 0
            ) {
                appliedDiscount.amount =
                    roundMoney(appliedDiscount.amount);

                context.currentItemTotal =
                    roundMoney(
                        context.currentItemTotal
                    );

                context.appliedDiscounts.push(
                    appliedDiscount
                );
            }
        }

        const baseTotal =
            baseItemTotal + order.deliveryCost;

        const finalTotal = Math.max(
            0,
            roundMoney(
                context.currentItemTotal +
                context.currentDeliveryCost
            )
        );

        return new PricingResult(
            roundMoney(baseTotal),
            context.appliedDiscounts,
            finalTotal
        );
    }
}
module.exports = PricingEngine;