const tahiry_manodidina = require('../data/villageData.json')
const { tenyNatoraly } = require('../miasa_matetika/normalizeText')

function mikaroka_tanana(tany_fisoratana) {
    const teny_navadika_natoraly = tenyNatoraly(tany_fisoratana);
    const lakile_tanana = Object.keys(tahiry_manodidina)

    for (const tanana of lakile_tanana) {
        const tananaNormaly = tenyNatoraly(tanana)
        const fanovana = new RegExp(`\\b${tananaNormaly.replace(/\s+/g, '[\\s-]*')}\\b`, 'i')

        if (fanovana.test(teny_navadika_natoraly)) {
            return tanana;
        }
    }

    return null;
}

function maka_ny_tanana(tanana) {
    const mombamoba_ny_tanana = tahiry_manodidina[tanana];
    if (!mombamoba_ny_tanana) return "Tsy fantatra tsara hoe ";

    return `Ireto avy ny mombamoba ny tanana ${tanana} :\n` +
        `Fombafomba : ${mombamoba_ny_tanana.fombafomba?.join(', ') || 'Tsy fantatra'}\n` +
        `Fandrarana : ${mombamoba_ny_tanana.interdits?.join(', ') || 'Tsy fantatra'}\n` +
        `Toro-hevitra : ${mombamoba_ny_tanana.conseils?.join(', ') || 'Tsy fantatra'}\n` +
        `Tantara : ${mombamoba_ny_tanana.histoire || 'Tsy misy tompoko'}\n`;
}

module.exports = {
    mikaroka_tanana,
    maka_ny_tanana,
};
