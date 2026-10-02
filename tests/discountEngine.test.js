const DiscountFactory = require("../src/DiscountFactory");
const PricingEngine = require("../src/PricingEngine");
const Product = require("../src/models/Product");
const CartItem = require("../src/models/CartItem");
const Customer = require("../src/models/Customer");
const Order = require("../src/models/Order");
const roundMoney = require("../src/utils/roundMoney");

function createEngine(configs) {
    const discounts = configs.map(config => DiscountFactory.create(config.type, config));
    return new PricingEngine(discounts);
}
function createOrder({ price = 1000, quantity = 1, category = "Книги", lastPurchaseDate = null, isFirstOrder = false, promoCode = null, createdAt = "2026-01-31T12:00:00", deliveryCost = 500 } = {}) {
    const product = new Product(1, "Товар", price, category);
    const item = new CartItem(product, quantity);

    const customer = new Customer(
        1,
        lastPurchaseDate,
        isFirstOrder
    );

    return new Order(
        1,
        customer,
        [item],
        promoCode,
        createdAt,
        deliveryCost
    );
}
// Процентная скидка 
test("Процентная скидка применяется", () => {
    const engine = createEngine([{ type: "percent", value: 10, name: "10%" }]);
    const order = createOrder({
        price: 1000
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(1400);
    expect(result.appliedDiscounts[0].amount).toBe(100);
});

test("Процентная скидка не применяется при нулевой сумме", () => {
    const engine = createEngine([{ type: "percent", value: 10, name: "10%" }]);
    const order = createOrder({
        price: 0
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(0);
});

// Фиксированная скидка 
test("Фиксированная скидка применяется при достижении порога", () => {
    const engine = createEngine([{ type: "fixed", value: 500, threshold: 3000, name: "500 от 3000" }]);
    const order = createOrder({
        price: 3000
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(3000);
    expect(result.appliedDiscounts[0].amount).toBe(500);
});

test("Фиксированная скидка не применяется ниже порога", () => {
    const engine = createEngine([{ type: "fixed", value: 500, threshold: 3000, name: "500 от 3000" }]);
    const order = createOrder({
        price: 2999
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(0);
});

// 3 по цене 2 
test("3 по цене 2 даёт одну бесплатную единицу", () => {
    const engine = createEngine([{ type: "threeForTwo", category: "Книги", name: "3 по цене 2" }]);
    const order = createOrder({
        price: 1000,
        quantity: 3,
        category: "Книги"
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(2500);
    expect(result.appliedDiscounts[0].amount).toBe(1000);
});

test("3 по цене 2 не применяется к другой категории", () => {
    const engine = createEngine([{ type: "threeForTwo", category: "Книги", name: "3 по цене 2" }]);
    const order = createOrder({
        price: 1000,
        quantity: 3,
        category: "Игрушки"
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(0);
});

// Промокод 
test("Промокод применяется", () => {
    const engine = createEngine([{ type: "promo", code: "SALE15", discountType: "percent", value: 15, name: "SALE15", active: true }]);
    const order = createOrder({
        price: 1000,
        promoCode: "SALE15"
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(1350);
    expect(result.appliedDiscounts[0].amount).toBe(150);
});

test("Неизвестный промокод не применяется", () => {
    const engine = createEngine([{ type: "promo", code: "SALE15", discountType: "percent", value: 15, name: "SALE15", active: true }]);
    const order = createOrder({
        price: 1000,
        promoCode: "WRONG"
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(0);
});
test("Просроченный промокод не применяется", () => {
    const engine = createEngine([{ type: "promo", code: "SALE15", discountType: "percent", value: 15, name: "SALE15", endDate: "2026-01-30T12:00:00", active: true }]);
    const order = createOrder({
        price: 1000,
        promoCode: "SALE15",
        createdAt: "2026-01-31T12:00:00"
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(0);
});
// Лояльность 
test("Скидка за лояльность применяется ровно через 30 дней", () => {
    const engine = createEngine([{ type: "loyalty", percent: 5, days: 30, name: "Лояльность" }]);
    const order = createOrder({
        price: 1000,
        lastPurchaseDate: "2026-01-01T12:00:00",
        createdAt: "2026-01-31T12:00:00"
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(1450);
    expect(result.appliedDiscounts[0].amount).toBe(50);
});
test("Скидка за лояльность не применяется после 30 дней", () => {
    const engine = createEngine([{ type: "loyalty", percent: 5, days: 30, name: "Лояльность" }]);
    const order = createOrder({
        price: 1000,
        lastPurchaseDate: "2025-12-31T12:00:00",
        createdAt: "2026-01-31T12:00:00"
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(0);
});

test("Скидка за лояльность не применяется, если последняя покупка в будущем", () => {
    const engine = createEngine([{ type: "loyalty", percent: 5, days: 30, name: "Лояльность" }]);
    const order = createOrder({
        price: 1000,
        lastPurchaseDate: "2026-02-01T12:00:00",
        createdAt: "2026-01-31T12:00:00"
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(0);
});

// Бесплатная доставка 
test("Бесплатная доставка применяется при сумме строго выше порога", () => {
    const engine = createEngine([{ type: "freeDelivery", threshold: 5000, name: "Бесплатная доставка" }]);
    const order = createOrder({
        price: 5001,
        deliveryCost: 500
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(5001);
    expect(result.appliedDiscounts[0].amount).toBe(500);
});

test("Бесплатная доставка не применяется ровно на пороге", () => {
    const engine = createEngine([{ type: "freeDelivery", threshold: 5000, name: "Бесплатная доставка" }]);
    const order = createOrder({
        price: 5000,
        deliveryCost: 500
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(5500);
    expect(result.appliedDiscounts).toHaveLength(0);
});

// Первый заказ 
test("Скидка за первый заказ применяется", () => {
    const engine = createEngine([{ type: "firstOrder", percent: 10, name: "Первый заказ" }]);
    const order = createOrder({
        price: 1000,
        isFirstOrder: true
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(1400);
    expect(result.appliedDiscounts[0].amount).toBe(100);
});

test("Скидка за первый заказ не применяется повторному клиенту", () => {
    const engine = createEngine([{ type: "firstOrder", percent: 10, name: "Первый заказ" }]);
    const order = createOrder({
        price: 1000,
        isFirstOrder: false
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(0);
});

// 3 по цене 2 + процент 
test("3 по цене 2 применяется раньше процентной скидки", () => {
    const engine = createEngine([{ type: "percent", value: 10, name: "10%" }, { type: "threeForTwo", category: "Книги", name: "3 по цене 2" }]);
    const order = createOrder({
        price: 1000,
        quantity: 3,
        category: "Книги"
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(2300);
    expect(result.appliedDiscounts[0].amount).toBe(1000);
    expect(result.appliedDiscounts[1].amount).toBe(200);
});

// Промокод + процент 
test("При большей выгоде выбирается промокод", () => {
    const engine = createEngine([{ type: "percent", value: 10, name: "10%" }, { type: "promo", code: "SALE15", discountType: "percent", value: 15, name: "SALE15", active: true }]);
    const order = createOrder({
        price: 1000,
        promoCode: "SALE15"
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(1);
    expect(result.appliedDiscounts[0].name).toBe("SALE15");
    expect(result.appliedDiscounts[0].amount).toBe(150);
});

test("При равной выгоде выбирается промокод", () => {
    const engine = createEngine([{ type: "percent", value: 10, name: "10%" }, { type: "promo", code: "SALE10", discountType: "percent", value: 10, name: "SALE10", active: true }]);
    const order = createOrder({
        price: 1000,
        promoCode: "SALE10"
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(1);
    expect(result.appliedDiscounts[0].name).toBe("SALE10");
});

// Нижняя граница 
test("Скидка не уводит итоговую сумму ниже нуля", () => {
    const engine = createEngine([{ type: "fixed", value: 5000, threshold: 0, name: "Большая скидка" }]);
    const order = createOrder({
        price: 1000,
        deliveryCost: 0
    });

    const result = engine.calculate(order);

    expect(result.finalTotal).toBe(0);
    expect(result.appliedDiscounts[0].amount).toBe(1000);
});

// Half to even 
test("Округление 1.005 выполняется до 1.00", () => { expect(roundMoney(1.005)).toBe(1); });
test("Округление 1.015 выполняется до 1.02", () => { expect(roundMoney(1.015)).toBe(1.02); });
// Breakdown 
test("Breakdown содержит только применённые скидки в правильном порядке", () => {
    const engine = createEngine([{ type: "percent", value: 10, name: "10%" }, { type: "threeForTwo", category: "Книги", name: "3 по цене 2" }]);
    const order = createOrder({
        price: 1000,
        quantity: 3,
        category: "Книги"
    });

    const result = engine.calculate(order);

    expect(result.appliedDiscounts).toHaveLength(2);

    expect(result.appliedDiscounts[0].name)
        .toBe("3 по цене 2");

    expect(result.appliedDiscounts[0].amount)
        .toBe(1000);

    expect(result.appliedDiscounts[0].reason)
        .toBe('3 по цене 2 для категории Книги');

    expect(result.appliedDiscounts[1].name)
        .toBe("10%");

    expect(result.appliedDiscounts[1].amount)
        .toBe(200);

    expect(result.baseTotal).toBe(3500);
    expect(result.finalTotal).toBe(2300);
});