const Discount = require("./Discount");
const AppliedDiscount = require("../models/AppliedDiscount");

class PromoDiscount extends Discount {
    constructor(name, code, type, value, endDate, active) {
        super(name);
        this.code = code;
        this.type = type;
        this.value = value;
        this.endDate = endDate;
        this.active = active;
    }

    apply(context) {
        // Нет промокода в заказе
        if (!context.order.promoCode) {
            return null;
        }

        // Введён другой промокод
        if (context.order.promoCode !== this.code) {
            return null;
        }

        // Промокод отключён
        if (!this.active) {
            return null;
        }

        // Промокод просрочен
        if (this.endDate &&
            new Date(context.order.createdAt) > new Date(this.endDate)
        ) {
            return null;
        }

        let amount;

        // Процентный промокод
        if (this.type === "percent") {
            amount =
                context.currentItemTotal *
                this.value /
                100;
        }

        // Фиксированный промокод
        else if (this.type === "fixed") {
            amount = this.value;
        }

        // Неизвестный тип промокода
        else {
            return null;
        }

        // Скидка не может быть больше текущей суммы
        amount = Math.min(
            amount,
            context.currentItemTotal
        );

        
        if (amount <= 0) {
            return null;
        }

        context.currentItemTotal -= amount;

        return new AppliedDiscount(
            this.name,
            amount,
            `Промокод ${this.code}`
        );
    }
}
module.exports = PromoDiscount;