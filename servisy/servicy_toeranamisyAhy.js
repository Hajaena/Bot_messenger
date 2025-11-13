// services/locationService.js
const alefa = require('node-fetch'); 
require('dotenv').config(); 

const makaFanazavanaFanampinymombanyToeranamisyanao = async (Mitsangana, Mitsivalana) => {
    const lakileOpenCAGE = process.env.OPENCAGE_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${Mitsangana}+${Mitsivalana}&key=${lakileOpenCAGE}&language=fr&pretty=1`;

    try {
        const valiny = await alefa(url);
        const tahiry = await valiny.json();

        if (tahiry.results && tahiry.results.length > 0) {
            const zavatra = tahiry.results[0].components;

            const manodidina = zavatra.suburb || zavatra.neighbourhood || zavatra.city_district || 'inconnu';
            const tanana = zavatra.city || zavatra.town || zavatra.village || 'inconnu';
            const firenena = zavatra.country || 'inconnu';
            console.log("Tanana :", tanana);

            return { Manodidina: manodidina, Renivohitra: tanana, Firenena: firenena };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Fahadisoana avy @ OpenCage :', error);
        return null;
    }
}

module.exports = {
    makaFanazavanaFanampinymombanyToeranamisyanao
};