const ConfigProvider = require("./src/ConfigProvider");
const DiscountFactory = require("./src/DiscountFactory");
const PricingEngine = require("./src/PricingEngine");

const configProvider = new ConfigProvider();

const discounts = configProvider

    .getConfig()

    .map(config => DiscountFactory.create(config.type, config));

const engine = new PricingEngine(discounts);

const Product = require("./src/models/Product");
const CartItem = require("./src/models/CartItem");
const Customer = require("./src/models/Customer");
const Order = require("./src/models/Order");

const product = new Product(

    1,

    "Книга",

    1000,

    "Книги"

);

const item = new CartItem(product, 3);

const customer = new Customer(

    1,

    null,

    true

);

const order = new Order(

    1,

    customer,

    [item],

    'SALE15',

    new Date(),

    500

);

const result = engine.calculate(order);

console.log(result);