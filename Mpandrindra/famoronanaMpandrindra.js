// famokaranaMpandrindra.js
require('dotenv').config()
const { genererAvecFallback } = require('../fanamboarana/mamokatraMiarakaFallback');
const Angona_Manodidina = require('../tahiry/tananaVoafantina.json');
const { tenyNatoraly } = require('../miasa_matetika/fanatsaranaTeny');
const { getExportedLocation } = require('../tahiry/tahiry_alefa');
const fetch = require('node-fetch');
const { getHistorique, saveMessage } = require('../tahiry/memoire')

const normaly = str => str.normalize("NFC");

function callSendAPI(body) {
  fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(json => console.log('Réponse Messenger:', json))
    .catch(err => console.error('Erreur SendAPI:', err));
}

// Fonction pour détecter si une salutation a déjà été faite récemment
function aDejaSalue(historique) {
  if (!historique || historique.length === 0) return false;

  const derniers3Messages = historique.slice(-3);
  const salutations = ['bonjour', 'salut', 'salama', 'hello', 'hi', 'bjr'];

  return derniers3Messages.some(msg =>
    msg.role === 'assistant' &&
    salutations.some(sal => msg.contenue.toLowerCase().includes(sal))
  );
}

// Fonction pour détecter si c'est une simple salutation
function estUneSalutation(texte) {
  const salutations = /^(bonjour|salut|salama|hello|hi|bjr|bsr|bonsoir|manahoana)[\s!?.,]*$/i;
  return salutations.test(texte.trim());
}

// Fonction pour détecter si l'utilisateur veut plus de détails
function veutPlusDeDetails(texte) {
  const patterns = [
    /\ben savoir plus\b/i,
    /\bplus de (détails|infos|informations)\b/i,
    /\bexplique(-moi)?\b/i,
    /\bdis(-moi)? (plus|tout|davantage)\b/i,
    /\bdétaille\b/i,
    /\bparle(-moi)? de\b/i,
    /\bquoi d'autre\b/i,
    /\bet\?\s*$/i,
    /\bc'est quoi\b/i,
    /\bcomment\b/i,
    /\bpourquoi\b/i
  ];
  return patterns.some(pattern => pattern.test(texte));
}

// Fonction pour détecter les demandes de devinettes
function veutAnkamantatra(texte) {
  const patterns = [
    /\bankamantatra\b/i,
    /\bdevinette\b/i,
    /\bdevine\b/i,
    /\bénigme\b/i
  ];
  return patterns.some(pattern => pattern.test(texte));
}

// Fonction pour détecter les demandes d'apprentissage
function veutHianatra(texte) {
  const patterns = [
    /\bhianatra\b/i,
    /\bétudier\b/i,
    /\betudier\b/i,
    /\bEtudier\b/i,
    /\bapprendre\b/i,
    /\béducation\b/i,
    /\beducation\b/i,
    /\benseigne(-moi)?\b/i,
    /\bapprends(-moi)?\b/i
  ];
  return patterns.some(pattern => pattern.test(texte));
}

// Fonction pour détecter si l'utilisateur demande la réponse à une devinette
function veutReponseAnkamantatra(texte, historique) {
  const demandeReponse = /\b(réponse|solution|answer|c'est quoi)\b/i.test(texte);

  // Vérifier si la dernière réponse du bot était une devinette
  const derniereReponse = historique.slice(-2).find(msg => msg.role === 'assistant');
  const etaitDevinette = derniereReponse && /🤔|devinette|Inona izany/i.test(derniereReponse.contenue);

  return demandeReponse && etaitDevinette;
}

async function Mamokatra(fangatahana, valiny) {
  const { tany_fanoratana, someso, senderId } = fangatahana.body;

  if (!tany_fanoratana || typeof tany_fanoratana !== 'string') {
    console.error('Texte invalide reçu:', tany_fanoratana);
    return valiny.status(400).json({ error: 'Misy zavatra tsy ampy na tsy mitombona' });
  }

  const teny_normaly = normaly(tenyNatoraly(tany_fanoratana));
  const lakile_tanana = Object.keys(Angona_Manodidina);

  let tanana_voatendry = lakile_tanana.find(village =>
    new RegExp(`\\b${normaly(tenyNatoraly(village)).replace(/\s+/g, '[\\s-]*')}\\b`, 'i').test(teny_normaly)
  ) || null;

  const toerana_mis_anao = getExportedLocation(senderId)
  tanana_voatendry = tanana_voatendry || toerana_mis_anao
  if (toerana_mis_anao) {
    console.log('📍 Position détectée:', toerana_mis_anao + ' Tanana tinao ho fantatra :' + tanana_voatendry)
  }

  const mombamoba_ny_tanana = tanana_voatendry ? Angona_Manodidina[tanana_voatendry] : null;
  const toe_javatra = mombamoba_ny_tanana
    ? `Infos sur ${tanana_voatendry} :\n` +
    `Coutumes : ${mombamoba_ny_tanana['fombafomba sy fanao']?.join(', ') || 'non disponibles'}\n` +
    `Interdits : ${mombamoba_ny_tanana['fady sy fandraràna']?.join(', ') || 'non disponibles'}\n` +
    `Conseils : ${mombamoba_ny_tanana['toro-hevitra']?.join(', ') || 'non disponibles'}\n` +
    `Histoire : ${mombamoba_ny_tanana['tantara'] || 'non disponible'}`
    : null;

  const tahiry = getHistorique(senderId);
  const dejaSalue = aDejaSalue(tahiry);
  const cestUneSalutation = estUneSalutation(tany_fanoratana);
  const veutDetails = veutPlusDeDetails(tany_fanoratana);
  const demandeAnkamantatra = veutAnkamantatra(tany_fanoratana);
  const demandeHianatra = veutHianatra(tany_fanoratana);
  const demandeReponseAnkamantatra = veutReponseAnkamantatra(tany_fanoratana, tahiry);

  // Contexte de conversation (8 derniers messages)
  const resaka_teo_aloha = tahiry
    .slice(-8)
    .map(someso =>
      someso.role === 'user'
        ? `User: ${someso.contenue}`
        : `Tsara: ${someso.contenue}`
    )
    .join('\n');

  const lalana = process.env.SERVERAN_I_NGROK
  const lalana_amin_ny_toeranao = `${lalana}/toerana_misy_ahy.html?senderId=${senderId}`

  // ✅ PROMPT OPTIMISÉ
  const fullPrompt = `Tu es Tsara ho Fantatra, assistant culturel malgache chaleureux et compétent pour les touristes et surtout pour les jeunes malgaches qui souhaite approfondire ces connaissances à ses propres cultures.

CONTEXTE
${tanana_voatendry && 'Village :' + tanana_voatendry}
Localisation : ${toerana_mis_anao || 'non précisée'}
${!tanana_voatendry && !toerana_mis_anao ?
      `Aucune localisation détectée. Voici le lien pour partager la position de l'utilisateur: ${lalana_amin_ny_toeranao}` : ''}

${toe_javatra || ''}

${resaka_teo_aloha ? `CONVERSATION RÉCENTE\n${resaka_teo_aloha}\n` : ''}

QUESTION ACTUELLE
"${tany_fanoratana}"

INSTRUCTIONS
${dejaSalue ? '- Tu as déjà salué, ne répète pas les salutations\n' : ''}
${cestUneSalutation && !dejaSalue ?
      '- Salue brièvement (1 phrase) et propose ton aide\n' : ''}
${demandeAnkamantatra ?
      `- Crée UNE devinette malgache en t'inspirant surtout de la culture malgache de Madagascar ou (pas obligatoire) de ${toe_javatra && 'ces données culturelles'}
- Donne UNIQUEMENT l'énoncé (en malgache + traduction)
- N'inclus PAS la réponse
- Invite à deviner ou demander la réponse

Quelle est ta réponse ?"
` : ''}
${demandeReponseAnkamantatra ?
      `- Identifie la devinette dans l'historique
- Donne la réponse en malgache et français
- Ajoute une brève explication (2-3 phrases)
` : ''}
${demandeHianatra ?
      `- Propose un contenu éducatif structuré
- Explique un aspect culturel intéressant
- Sois pédagogue et motivant
NB: Souviens-toi que l'utilisateur veut apprendre
` : ''}
${veutDetails && !demandeAnkamantatra && !demandeHianatra ?
      '- Développe ta réponse précédente (6-8 phrases)\n- Ajoute exemples et anecdotes\n' :
      !demandeAnkamantatra && !demandeHianatra ? '- Réponds de façon concise (2-4 phrases)\n' : ''}
${!toe_javatra && tanana_voatendry ?
      `- Aucune donnée pour "${tanana_voatendry}", propose le lien : ${lalana_amin_ny_toeranao}\n` : ''}

Voici le lien pour partager la position de l'utilisateur au cas ou il demande : ${lalana_amin_ny_toeranao}

STYLE
- Ton naturel et conversationnel
- Base-toi uniquement sur les données fournies
- Ne répète pas les infos de l'historique
- 6 émojis maximum

Réponds maintenant :`.trim();

  console.log("Toerana misy ahy:", toerana_mis_anao)

  try {
    callSendAPI({
      recipient: { id: senderId },
      sender_action: "mark_seen"
    })

    await new Promise(resolve => setTimeout(resolve, 1000));

    callSendAPI({
      recipient: { id: senderId },
      sender_action: "typing_on"
    });

    // ✅ Utilise le système de fallback automatique (Gemini → Cohere)
    console.log('🔄 Génération avec fallback Gemini → Cohere...');
    const teny = await genererAvecFallback(fullPrompt);

    saveMessage(senderId, 'user', tany_fanoratana);
    saveMessage(senderId, 'assistant', teny);

    // Délai proportionnel à la longueur de la réponse
    setTimeout(() => {
      valiny.json({ result: teny });
    }, Math.min(teny.length * 8, 1200));
  } catch (err) {
    console.error('❌ ERREUR CRITIQUE: Tous les modèles ont échoué:', err);

    const messageErreur = "Désolé, je rencontre un problème technique temporaire. Pouvez-vous réessayer dans quelques instants ? 🙏";

    // Envoyer le message d'erreur à l'utilisateur via Messenger
    try {
      callSendAPI({
        recipient: { id: senderId },
        message: { text: messageErreur }
      });
    } catch (messengerErr) {
      console.error('Erreur lors de l\'envoi du message d\'erreur:', messengerErr);
    }

    valiny.status(500).json({
      error: 'Fahadisoana tamin ny famoronana vontoatiny',
      details: err.message || err.toString(),
      result: messageErreur
    });
  }
}

module.exports = { Mamokatra };