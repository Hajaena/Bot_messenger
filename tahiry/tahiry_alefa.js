const fs = require('fs');
const path = require('path');
const chemin = path.join(__dirname, 'toerana_exporte.json');

function charger() {
    return fs.existsSync(chemin)
        ? JSON.parse(fs.readFileSync(chemin, 'utf-8'))
        : {};
}

function enregistrer(data) {
    fs.writeFileSync(chemin, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Stocke ou met à jour la localisation d'un utilisateur
 * @param {string} senderId 
 * @param {string} lieu 
 */
function setExportedLocation(senderId, lieu) {
    const data = charger();
    data[senderId] = lieu;
    enregistrer(data);
}

/**
 * Récupère la localisation enregistrée pour un utilisateur
 * @param {string} senderId 
 * @returns {string|null}
 */
function getExportedLocation(senderId) {
    const data = charger();
    return data[senderId] || null;
}

module.exports = { setExportedLocation, getExportedLocation };