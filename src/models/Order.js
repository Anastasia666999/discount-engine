class Order {
    constructor(id, customer, items, promoCode, createdAt, deliveryCost) {
        this.id = id;
        this.customer = customer;
        this.items = items;
        this.promoCode = promoCode;
        this.createdAt = createdAt;
        this.deliveryCost = deliveryCost;
    }
}

module.exports = Order;