// genererAvecFallback.js
// Système de fallback automatique entre Gemini et Cohere

const { mamokatra_miaraka_gemini } = require('./gemini');
const { generateWithCohere } = require('./cohere');

/**
 * Générateur universel avec fallback automatique entre modèles
 * Essaie Gemini en premier, puis bascule sur Cohere en cas d'échec
 * 
 * @param {string} prompt - Le prompt à envoyer
 * @param {number} maxRetries - Nombre maximum de tentatives par modèle (défaut: 2)
 * @returns {Promise<string>} Réponse générée
 */
async function genererAvecFallback(prompt, maxRetries = 2) {
    const modeles = [
        {
            nom: 'Gemini',
            fonction: mamokatra_miaraka_gemini,
            priorite: 1
        },
        {
            nom: 'Cohere',
            fonction: generateWithCohere,
            priorite: 2
        }
    ];

    const erreurs = [];

    // Essayer chaque modèle avec retry
    for (const modele of modeles) {
        for (let tentative = 1; tentative <= maxRetries; tentative++) {
            try {
                console.log(`🤖 [${modele.nom}] Tentative ${tentative}/${maxRetries}...`);

                const debut = Date.now();
                const reponse = await modele.fonction(prompt);
                const duree = Date.now() - debut;

                console.log(`✅ [${modele.nom}] Succès en ${duree}ms`);
                return reponse;

            } catch (erreur) {
                const messageErreur = erreur.message || erreur.toString();
                console.warn(`⚠️ [${modele.nom}] Tentative ${tentative}/${maxRetries} échouée: ${messageErreur}`);

                erreurs.push({
                    modele: modele.nom,
                    tentative,
                    erreur: messageErreur,
                    timestamp: new Date().toISOString()
                });

                // Attendre avant de réessayer (sauf dernière tentative)
                if (tentative < maxRetries) {
                    const delai = tentative * 1000; // 1s, 2s, etc.
                    console.log(`⏳ [${modele.nom}] Attente de ${delai}ms avant nouvelle tentative...`);
                    await new Promise(resolve => setTimeout(resolve, delai));
                }
            }
        }

        console.error(`❌ [${modele.nom}] Tous les essais ont échoué, passage au modèle suivant...`);
    }

    // Si tous les modèles ont échoué
    console.error('💥 ÉCHEC CRITIQUE: Tous les modèles IA ont échoué');
    console.error('Détails des erreurs:', JSON.stringify(erreurs, null, 2));

    throw new Error(
        `Tous les modèles IA ont échoué après ${maxRetries * modeles.length} tentatives. ` +
        `Erreurs: ${erreurs.map(e => `${e.modele}(${e.erreur})`).join(', ')}`
    );
}

/**
 * Version légère avec un seul essai par modèle (plus rapide)
 */
async function genererAvecFallbackRapide(prompt) {
    return genererAvecFallback(prompt, 1);
}

/**
 * Teste la disponibilité des modèles
 * @returns {Promise<Object>} État de chaque modèle
 */
async function testerDisponibiliteModeles() {
    const testPrompt = "Réponds juste 'OK'";
    const resultats = {};

    // Test Gemini
    try {
        await mamokatra_miaraka_gemini(testPrompt);
        resultats.gemini = { disponible: true, message: 'Opérationnel' };
        console.log('✅ Gemini: Opérationnel');
    } catch (err) {
        resultats.gemini = { disponible: false, message: err.message };
        console.log('❌ Gemini: Indisponible -', err.message);
    }

    // Test Cohere
    try {
        await generateWithCohere(testPrompt);
        resultats.cohere = { disponible: true, message: 'Opérationnel' };
        console.log('✅ Cohere: Opérationnel');
    } catch (err) {
        resultats.cohere = { disponible: false, message: err.message };
        console.log('❌ Cohere: Indisponible -', err.message);
    }

    return resultats;
}

module.exports = {
    genererAvecFallback,
    genererAvecFallbackRapide,
    testerDisponibiliteModeles
};