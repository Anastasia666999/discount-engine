const discountConfig = require("./config/discountConfig");

class ConfigProvider {

    constructor() {
        if (ConfigProvider.instance) {

            return ConfigProvider.instance;

        }

        this.config = discountConfig;
        ConfigProvider.instance = this;
    }

    getConfig() {
        //добавили индекс с помощью метода map
        const configWithIndex = this.config.map((config, index) => ({
            config,
            index
        }));

        //приоритет скидок 
        const getStage = (config) => {

            if (config.type === "threeForTwo") {

                return 1;
            }

            if (config.type === "percent" ||
                config.type === "loyalty" ||
                config.type === "firstOrder") {

                return 2;
            }

            if (config.type === "fixed") {

                return 3;
            }

            if (config.type === "freeDelivery") {

                return 4;
            }

            if (config.type === "promo") {

                if (config.discountType === "percent") {

                    return 2;
                }
                return 3;
            }

            return 99;
        };

        return configWithIndex

            .sort((a, b) => {

                const stageDifference = getStage(a.config) - getStage(b.config);
                //если этап не равен нулю то по приоритетам, иначе по порядку(индекс)
                if (stageDifference !== 0) {

                    return stageDifference;

                }

                return a.index - b.index;
            })
            //почистили массив от технического индекса внутри этой функции (другие файлы его не увидели бы)
            .map(item => item.config);

    }

}

module.exports = ConfigProvider;