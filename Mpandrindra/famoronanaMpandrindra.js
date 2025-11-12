// famokaranaMpandrindra.js
require('dotenv').config()
const { generateWithCohere } = require('../fanamboarana/cohere');
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

// 🆕 Fonction pour détecter si une salutation a déjà été faite récemment
function aDejaSalue(historique) {
  if (!historique || historique.length === 0) return false;

  const derniers3Messages = historique.slice(-3);
  const salutations = ['bonjour', 'salut', 'salama', 'hello', 'hi', 'bjr'];

  return derniers3Messages.some(msg =>
    msg.role === 'assistant' &&
    salutations.some(sal => msg.contenue.toLowerCase().includes(sal))
  );
}

// 🆕 Fonction pour détecter si c'est une simple salutation
function estUneSalutation(texte) {
  const salutations = /^(bonjour|salut|salama|hello|hi|bjr|bsr|bonsoir|manahoana)[\s!?.,]*$/i;
  return salutations.test(texte.trim());
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

  // 🆕 Contexte de conversation plus concis (seulement 5 derniers messages)
  const resaka_teo_aloha = tahiry
    .slice(-5)
    .map(someso =>
      someso.role === 'user'
        ? `User: ${someso.contenue}`
        : `Tsara: ${someso.contenue}`
    )
    .join('\n');

  const lalana = process.env.SERVERAN_I_NGROK
  const lalana_amin_ny_toeranao = `${lalana}/toerana_misy_ahy.html?senderId=${senderId}`

  // 🆕 Prompt complètement revu pour un style conversationnel
  const fullPrompt = `
Tu es Tsara ho Fantatra, assistant culturel malgache. Réponds de façon **NATURELLE et CONCISE**, comme dans une vraie conversation.

📍 Village : ${tanana_voatendry || 'non précisé'} | Localisation : ${toerana_mis_anao || 'non précisée'}

${toe_javatra ? `📚 Données disponibles :\n${toe_javatra}` : ''}

${resaka_teo_aloha ? `💬 Historique récent :\n${resaka_teo_aloha}` : ''}

❓ Question actuelle : "${tany_fanoratana}"

🎯 RÈGLES STRICTES :

${dejaSalue ? '⚠️ TU AS DÉJÀ SALUÉ dans cette conversation. NE répète PAS "Bonjour" ou "Salama".' : ''}

${cestUneSalutation && !dejaSalue ?
      '👋 C\'est une simple salutation. Réponds brièvement (ex: "Salama! Comment puis-je t\'aider avec la culture malgache?") puis STOP.'
      : ''}

- **MAX 2-3 phrases courtes** (80 tokens max)
- **Aucune structure avec tirets ou listes** sauf si nécessaire
- **Ton conversationnel** : parle comme un ami, pas comme un document
- **Émojis minimaux** : 1-2 max par réponse
- **Ne répète JAMAIS les informations** déjà données dans l'historique
- Si pas d'info disponible → propose le lien : ${lalana_amin_ny_toeranao}
- Si question vague → demande précision simplement
- **N'invente rien**, utilise uniquement les données fournies

${!tanana_voatendry && !toerana_mis_anao ?
      '⚠️ Pas de localisation → demande poliment : "De quel village veux-tu parler ?"'
      : ''}

Réponds maintenant de façon ULTRA CONCISE et NATURELLE :
`.trim();

  console.log("Toerana misy ahy:", toerana_mis_anao)

  try {
    callSendAPI({
      recipient: { id: senderId },
      sender_action: "mark_seen"
    })

    await new Promise(resolve => setTimeout(resolve, 1000)); // Réduit à 1s

    callSendAPI({
      recipient: { id: senderId },
      sender_action: "typing_on"
    });

    const teny = await generateWithCohere(fullPrompt);

    saveMessage(senderId, 'user', tany_fanoratana);
    saveMessage(senderId, 'assistant', teny);

    // ⏳ Délai plus court et proportionnel
    setTimeout(() => {
      valiny.json({ result: teny });
    }, Math.min(teny.length * 8, 1200)); 
  } catch (err) {
    console.error('Erreur génération:', err);
    valiny.status(500).json({
      error: 'Fahadisoana tamin ny famoronana vontoatiny',
      details: err.message || err.toString(),
    });
  }
}

module.exports = { Mamokatra };