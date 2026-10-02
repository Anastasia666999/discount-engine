function roundMoney(amount) {
    //перевод рублей в копейки
    const scaled = amount * 100;
    const lower = Math.floor(scaled);
    const fraction = scaled - lower;


    const epsilon = Number.EPSILON * Math.max(1, Math.abs(scaled)) * 4;

    if (fraction < 0.5 - epsilon) {
        return lower / 100;
    }

    if (fraction > 0.5 + epsilon) {
        return (lower + 1) / 100;
    }

    // Ровно половина:// оставляем чётное число копеек
    if (lower % 2 === 0) {
    return lower / 100;
}

return (lower + 1) / 100;
}
module.exports = roundMoney;