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
    ? `Ireto ny mombamoba an'ny ${tanana_voatendry} :\n` +
    `Fombafomba sy fanao : ${mombamoba_ny_tanana['fombafomba sy fanao']?.join(', ') || 'mbola tsy misy'}\n` +
    `Fady sy fandraràna : ${mombamoba_ny_tanana['fady sy fandraràna']?.join(', ') || 'mbola tsy misy'}\n` +
    `Toro-hevitra : ${mombamoba_ny_tanana['toro-hevitra']?.join(', ') || 'tsisy toro-hevitra'}\n` +
    `Tantara : ${mombamoba_ny_tanana['tantara'] || 'tsisy tantara'}`
    : "⛔️ Aucune information disponible sur ce village.";

  // const tahiry = Array.isArray(someso) ? someso : [];
  const tahiry = getHistorique(senderId);
  const resaka_teo_aloha = tahiry
    .slice(-15)
    .map(someso =>
      someso.role === 'user'
        ? `👤 Utilisateur : ${someso.contenue}`
        : `Tsara ho fantatra : ${someso.contenue}`
    )
    .join('\n');

  const lalana = process.env.SERVERAN_I_NGROK
  const lalana_amin_ny_toeranao = `${lalana}/toerana_misy_ahy.html?senderId=${senderId}`



  const fullPrompt = `
Tu es **Tsara ho Fantatra**, un assistant culturel malgache bienveillant et intelligent.

🧭 Ton rôle : Répondre aux questions liées à la culture malgache (fombafomba sy fanao, fady sy fandraràna, toro-hevitra, tantara) avec clarté, authenticité et concision.

📌 Village demandé : ${tanana_voatendry || 'Non spécifié'}
📍 Localisation détectée : ${toerana_mis_anao || 'Non spécifiée'}

📚 Connaissances disponibles :
${toe_javatra}

🗂️ Contexte de la conversation :
(Si tu détectes une salutation récente dans l'historique, ne la répète pas.)
${resaka_teo_aloha}

💬 Question actuelle de l’utilisateur :
${tany_fanoratana}

🧠 Consignes :
- Si la localisation n’est pas précisée et aucun village détecté, réponds poliment :  
  "Pour mieux t’aider, peux-tu me préciser ta localisation (voici le lien pour la partager : ${lalana_amin_ny_toeranao}) ou le village dont tu souhaites connaître la culture ?"

- Si l’utilisateur dit seulement “Bonjour”, “Salut”, "Salama" ou une autre salutation :  
  • Réponds brièvement avec une salutation amicale (si elle n’est pas déjà présente dans l’historique)  
  • Encourage ensuite l’utilisateur à poser une question sur la culture malgache.  
  • N'invente pas de sujet automatiquement.

- Si aucun sujet clair n’est détecté, demande poliment à l’utilisateur de préciser sa question.
- Ne change pas de village de référence à moins que l’utilisateur en mentionne un nouveau explicitement.
- Si la question est vague ou générale (ex : “Parle-moi de…”), propose uniquement une **brève synthèse** des 4 catégories, en une seule phrase chacune.
- Si l'utilisateur semble avoir changé d’endroit → invite à mettre à jour sa localisation ici : ${lalana_amin_ny_toeranao}
- Réponds uniquement à partir des données disponibles : n’invente rien.
- Si la question concerne :
  • les coutumes → donne uniquement les “fombafomba sy fanao”
  • les interdits → uniquement les “fady sy fandraràna”
  • les conseils → uniquement les “toro-hevitra”
  • l'histoire → uniquement la “tantara” (sans extrapoler)
- Si la demande est large ou imprécise, résume les sections disponibles de façon claire.

🎁 Si le mot “ankamantatra” est mentionné → propose une devinette culturelle malgache + réponse.
🎓 Si “étudier” est mentionné → propose une idée éducative sur la culture malgache.

🗣️ Langue : réponds uniquement en français, dans un ton amical, logique et professionnel.
💬 Style : utilise des émojis sobres (📌, 📍, 🔹, 🎓…) pour structurer visuellement comme sur LinkedIn.
🔒 Réponse limitée à 250 tokens maximum.
`.trim();

  console.log("Toerana misy ahy:", toerana_mis_anao)

  try {
    // 🎬 Lecture simulée
    callSendAPI({
      recipient: { id: senderId },
      sender_action: "mark_seen"
    })


    // Pause pendant que l'utilisateur voit "Tsara ho Fantatra est en train d'écrire..."
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 🧠 Début de rédaction simulée (typing_on)
    callSendAPI({
      recipient: { id: senderId },
      sender_action: "typing_on"
    });

    const teny = await generateWithCohere(fullPrompt);



    saveMessage(senderId, 'user', tany_fanoratana);
    saveMessage(senderId, 'assistant', teny);

    // ⏳ Attente proportionnelle à la longueur de la réponse
    setTimeout(() => {
      valiny.json({ result: teny });
    }, Math.min(teny.length * 10, 1500));
  } catch (err) {
    console.error('Erreur génération:', err);
    valiny.status(500).json({
      error: 'Fahadisoana tamin ny famoronana vontoatiny',
      details: err.message || err.toString(),
    });
  }
}

module.exports = { Mamokatra };