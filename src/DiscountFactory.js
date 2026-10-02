const PercentDiscount = require("./discounts/PercentDiscount");
const FixedDiscount = require("./discounts/FixedDiscount");
const ThreeForTwoDiscount = require("./discounts/ThreeForTwoDiscount");
const PromoDiscount = require("./discounts/PromoDiscount");
const LoyaltyDiscount = require("./discounts/LoyaltyDiscount");
const FreeDeliveryDiscount = require("./discounts/FreeDeliveryDiscount");
const FirstOrder = require("./discounts/FirstOrder");

class DiscountFactory {
    static create(type, config) {

        let discount;

        switch (type) {
            case "percent":
                discount = new PercentDiscount(
                    config.name,
                    config.value
                );

                discount.stage = 2;
                discount.conflictGroup = "percentPromo";
                discount.conflictPriority = 1;
                break;

            case "fixed":
                discount = new FixedDiscount(
                    config.name,
                    config.value,
                    config.threshold
                );

                discount.stage = 3;
                break;

            case "threeForTwo":
                discount = new ThreeForTwoDiscount(
                    config.name,
                    config.category
                );

                discount.stage = 1;
                break;

            case "promo":
                discount = new PromoDiscount(
                    config.name,
                    config.code,
                    config.discountType,
                    config.value,
                    config.endDate,
                    config.active
                );

                discount.stage = 2;

                if (config.discountType === "percent") {
                    discount.conflictGroup = "percentPromo";
                    discount.conflictPriority = 2;
                }

                break;

            case "loyalty":
                discount = new LoyaltyDiscount(
                    config.name,
                    config.percent,
                    config.days
                );

                discount.stage = 2;
                break;

            case "freeDelivery":
                discount = new FreeDeliveryDiscount(
                    config.name,
                    config.threshold
                );

                discount.stage = 4;
                break;

            case "firstOrder":
                discount = new FirstOrder(
                    config.name,
                    config.percent
                );

                discount.stage = 2;
                break;

            default:
                throw new Error(`Неизвестный тип скидки: ${type}`);
        }

        return discount;
    }
}
module.exports = DiscountFactory;