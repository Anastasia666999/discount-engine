//какая скидка применяется
class AppliedDiscount {
    constructor(name, amount, reason) {
        this.name = name;
        this.amount = amount;
        this.reason = reason;
    }
}
module.exports = AppliedDiscount;