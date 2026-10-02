//конфигурация - данные
const discountConfig = [
    {
        type: "percent",
        value: 10,
        name: "Осенняя распродажа"
    },
    {
        type: "fixed",
        value: 500,
        threshold: 3000,
        name: "500 рублей от 3000"
    },
    {
        type: "threeForTwo",
        category: "Книги",
        name: "3 по цене 2"
    },
    {
        type: "loyalty",
        percent: 5,
        days: 30,
        name: "Лояльность"
    },
    {
        type: "freeDelivery",
        threshold: 5000,
        name: "Бесплатная доставка"
    },
    {

        type: "promo",
        code: "SALE15",
        discountType: "percent",
        value: 15,
        name: "Промокод SALE15",
        active: true

    }
];

module.exports = discountConfig;