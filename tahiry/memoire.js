// memoire.js

const fs = require('fs');
const path = require('path');
const chemin = path.join(__dirname, 'memoire.json');

function chargerMemoire() {
    return JSON.parse(fs.readFileSync(chemin, 'utf-8'));
}

function enregistrerMemoire(memo) {
    fs.writeFileSync(chemin, JSON.stringify(memo, null, 2));
}

function getHistorique(senderId, limit = 15) {
    const memoire = chargerMemoire();
    return (memoire[senderId] || []).slice(-limit);
}

function saveMessage(senderId, role, contenue) {
    const memoire = chargerMemoire();
    memoire[senderId] = memoire[senderId] || [];
    memoire[senderId].push({ role, contenue });

    if (memoire[senderId]?.length > 20) {
        delete memoire[senderId]
    } else if (memoire[senderId]?.length > 15) {
        memoire[senderId] = memoire[senderId].slice(-15)
    }
    enregistrerMemoire(memoire)



}

module.exports = { getHistorique, saveMessage }