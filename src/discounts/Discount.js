//общий класс для скидок
class Discount {
    constructor(name) {
        this.name = name;
    }

    apply(context) {
        throw new Error('Метод должен быть реализован');
    }
}
module.exports = Discount;