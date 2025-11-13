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

// 🆕 Fonction pour détecter si l'utilisateur veut plus de détails
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

// 🆕 Fonction pour détecter les demandes de devinettes
function veutAnkamantatra(texte) {
  const patterns = [
    /\bankamantatra\b/i,
    /\bdevinette\b/i,
    /\bdevine\b/i,
    /\bénigme\b/i
  ];
  return patterns.some(pattern => pattern.test(texte));
}

// 🆕 Fonction pour détecter les demandes d'apprentissage
function veutHianatra(texte) {
  const patterns = [
    /\bhianatra\b/i,
    /\bétudier\b/i,
    /\bapprendre\b/i,
    /\béducation\b/i,
    /\benseigne(-moi)?\b/i,
    /\bapprends(-moi)?\b/i
  ];
  return patterns.some(pattern => pattern.test(texte));
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
${!tanana_voatendry && !toerana_mis_anao ?
      `🚨 PRIORITÉ ABSOLUE - AUCUNE LOCALISATION DÉTECTÉE 🚨
  
  Tu DOIS OBLIGATOIREMENT commencer ta réponse par :
  "Je n'ai pas encore votre localisation 📍. Partagez-la via ce lien pour que je puisse mieux vous aider. Voici le lien : '${lalana_amin_ny_toeranao}'
  
  Ou dites-moi simplement de quel village vous voulez parler ! 😊"
  
  PUIS tu peux répondre brièvement à sa question si possible avec des informations générales sur Madagascar.`
      : ''}

${toe_javatra ? `📚 Données disponibles :\n${toe_javatra}` : ''}

${resaka_teo_aloha ? `💬 Historique récent :\n${resaka_teo_aloha}` : ''}

❓ Question actuelle : "${tany_fanoratana}"

🎯 RÈGLES DE RÉPONSE :

${dejaSalue ? '⚠️ TU AS DÉJÀ SALUÉ dans cette conversation. NE répète PAS "Bonjour" ou "Salama".' : ''}

${cestUneSalutation && !dejaSalue ?
      '👋 C\'est une simple salutation. Réponds brièvement (ex: "Salama! Comment puis-je t\'aider avec la culture malgache?") puis STOP.'
      : ''}

${demandeAnkamantatra ?
      `🎁 L'utilisateur demande une DEVINETTE (ankamantatra). 
  ${toe_javatra ?
        `Invente une devinette malgache intéressante et culturelle basée sur ces données : ${mombamoba_ny_tanana['fombafomba sy fanao']?.join(', ') || 'culture malgache générale'}.`
        :
        'Invente une devinette malgache culturelle générale.'}
  
  Format OBLIGATOIRE :
  Message 1 : "Voici une devinette malgache : [énoncé de la devinette en malgache] 🤔
  
  Réfléchis bien... Je te donnerai la réponse dans un instant !"
  
  Message 2 : "Réponse : [la réponse en malgache et français] ✨
  
  [Courte explication culturelle]"
  
  Exemple :
  Message 1 : "Mandeha tsy manana tongotra, miteny tsy manana vava. Inona izany? 🤔
  Réfléchis bien..."
  
  Message 2 : "Réponse : Ny taratasy (la lettre) ✉️
  Une devinette traditionnelle qui joue sur les propriétés de la lettre écrite."`
      : ''}

${demandeHianatra ?
      `🎓 L'utilisateur veut APPRENDRE/ÉTUDIER la culture malgache.
  Propose une idée éducative concrète et engageante :
  - Un aspect culturel intéressant à découvrir
  - Une pratique traditionnelle à comprendre
  - Un conseil pour mieux connaître la culture
  Sois pédagogue et motivant ! (max 150 tokens)`
      : ''}

${veutDetails && !demandeAnkamantatra && !demandeHianatra ?
      '📖 L\'utilisateur veut plus de détails. Tu peux répondre avec 8-10 phrases (max 300 tokens) pour bien expliquer.'
      :
      !demandeAnkamantatra && !demandeHianatra ? '💬 Réponse courte : MAX 2-3 phrases (80 tokens max)' : ''
    }

- **Ton conversationnel** : parle comme un ami, pas comme un document
- **Émojis minimaux** : 1-2 max par réponse
- **Ne répète JAMAIS les informations** déjà données dans l'historique
- **N'invente rien**, utilise uniquement les données fournies


${!toe_javatra && tanana_voatendry ?
      `⚠️ Pas d'infos sur "${tanana_voatendry}" dans la base. Propose le lien : ${lalana_amin_ny_toeranao}`
      : ''}

Réponds maintenant de façon NATURELLE :
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
    }, Math.min(teny.length * 8, 1200)); // Réduit de 10 à 8, max 1.2s au lieu de 1.5s
  } catch (err) {
    console.error('Erreur génération:', err);
    valiny.status(500).json({
      error: 'Fahadisoana tamin ny famoronana vontoatiny',
      details: err.message || err.toString(),
    });
  }
}

module.exports = { Mamokatra };