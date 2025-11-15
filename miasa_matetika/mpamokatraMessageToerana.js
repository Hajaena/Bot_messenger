// genererMessageLocalisation.js
// Fichier dédié à la génération des messages de bienvenue lors de la réception de localisation

const { genererAvecFallback } = require('../fanamboarana/mamokatraMiarakaFallback');

/**
 * Génère un message de bienvenue personnalisé quand l'utilisateur partage sa position
 * @param {string} nomVillage - Nom du village/lieu détecté
 * @param {object} donneesVillage - Données culturelles du village (fady, coutumes, etc.)
 * @param {string} lalana_amin_ny_toeranao - Lien pour partager la position
 * @returns {Promise<string>} Message généré par l'IA
 */
async function genererMessageBienvenue(nomVillage, donneesVillage, lalana_amin_ny_toeranao) {
    const toe_javatra = donneesVillage
        ? `Infos sur ${nomVillage} :\n` +
        `Interdits : ${donneesVillage['fady sy fandraràna']?.join(', ') || 'non disponibles'}\n`
        : null;

    const prompt = `Tu es Tsara ho Fantatra, assistant culturel malgache chaleureux pour les touristes et surtout pour les jeunes malgaches qui souhaite approfondire ces connaissances à ses propres cultures.

CONTEXTE
L'utilisateur vient de partager sa position GPS et se trouve à : ${nomVillage}
Tu viens juste de saluer l'utiliateur ne le salue plus.

${toe_javatra || 'Aucune donnée disponible pour ce lieu.'}

INSTRUCTIONS
${nomVillage ? '- Souhaite lui la bienvenue sur le lieu qui est : ' + nomVillage : ''}
${donneesVillage && donneesVillage['fady sy fandraràna']?.length > 0
            ? `- Liste les ${donneesVillage['fady sy fandraràna'].length} interdits (Fady) importants à respecter dans ce lieu (format numéroté)
- Sois précis et respectueux sur ces interdits`
            : '- Mentionne qu\'il n\'y a pas d\'interdits spécifiques connus pour ce lieu'}
- Invite l'utilisateur à découvrir plus sur ce lieu avec ces suggestions : "Interdits, Coutumes, Conseils, Histoire, Etudier et Ankamantatra", Ne les répète plus car elles sont déjà présente! juste invite-le (1 à 2 phrases max)
- Ton naturel et bienveillant
- Ajoute des émojis
- Parle en malgache ou en français selon la langue utilisée précédemment par l'utilisateur

Réponds maintenant :`.trim();

    try {
        // ✅ Utilise le système de fallback automatique
        const reponse = await genererAvecFallback(prompt);
        return reponse;
    } catch (err) {
        console.error('❌ Tous les modèles ont échoué pour le message de bienvenue:', err);
        // Message de fallback final en cas d'échec de tous les modèles
        return `📍 Vous êtes actuellement à ${nomVillage}. Merci pour votre confiance !\nVoici quelque piste pour découvrir ce village 🥰\n\n✨ Qu'aimeriez-vous découvrir à propos de ce lieu ?`;
    }
}

/**
 * Génère un message empathique quand le lieu n'est pas reconnu
 * @param {string} lalana_amin_ny_toeranao - Lien pour partager la position
 * @returns {Promise<string>} Message généré par l'IA
 */
async function genererMessageLieuInconnu(lalana_amin_ny_toeranao) {
    const prompt = `Tu es Tsara ho Fantatra, assistant culturel malgache chaleureux.

SITUATION
L'utilisateur a partagé sa position GPS mais elle ne correspond à aucun lieu de notre base de données culturelles.

INSTRUCTIONS
- Explique gentiment que le lieu n'est pas reconnu (1-2 phrases)
- Rassure l'utilisateur et encourage à réessayer
- Fournis ce lien pour qu'il puisse renvoyer sa position : ${lalana_amin_ny_toeranao}
- Ton empathique et encourageant
- Maximum 2 émojis

Réponds maintenant :`.trim();

    try {
        // ✅ Utilise le système de fallback automatique
        const reponse = await genererAvecFallback(prompt);
        return reponse;
    } catch (err) {
        console.error('❌ Tous les modèles ont échoué pour le message lieu inconnu:', err);
        // Message de fallback final
        return `Vous êtes dans un lieu inconnu 😢. Merci de réessayer pour que je puisse trouver votre position.\n\nVoici le lien : ${lalana_amin_ny_toeranao}`;
    }
}

module.exports = {
    genererMessageBienvenue,
    genererMessageLieuInconnu
};