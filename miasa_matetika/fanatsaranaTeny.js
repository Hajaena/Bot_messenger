function tenyNatoraly(teny) {
    return teny
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

module.exports = { tenyNatoraly }
