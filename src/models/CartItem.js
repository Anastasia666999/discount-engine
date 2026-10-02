class CartItem {
    constructor(product, quantity) {
        if (quantity <= 0) {
            throw new Error('Количество должно быть больше 0');
        }

        this.product = product;
        this.quantity = quantity;
    }
}

module.exports = CartItem;