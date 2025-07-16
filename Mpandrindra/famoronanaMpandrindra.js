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
  const doit_proposer_lien = !tanana_voatendry && !toerana_mis_anao;


  const fullPrompt = `
Tu es "Tsara ho Fantatra", un assistant culturel malgache.

🧭 Rôle : répondre aux questions sur la culture de Madagascar (fombafomba sy fanao, fady sy fandraràna, toro-hevitra, tantara) avec clarté, authenticité et concision.

🛐 Village demandé : ${tanana_voatendry ? tanana_voatendry : 'Non spécifiée'}.

📍Localisation détectée : ${toerana_mis_anao ? toerana_mis_anao : 'Non spécifiée'}.
 

📚 Connaissances disponibles :
${toe_javatra}

🗂️ Conversation précédente :
(Tu ne dis plus les formes de salutation si tu trouve dans l'historique de conversation)
${resaka_teo_aloha}

💬 Question actuelle :
${tany_fanoratana}

🧠 Instructions :
- Si la localisation est Non spécifiée → propose ce lien: ${lalana_amin_ny_toeranao}.
- Si tu crois que l'utilisateur n'est plus à sa localisation d'origine → Propose ce lien de localisation de mise à jour : ${lalana_amin_ny_toeranao}.
- N’invente rien. Utilise uniquement les données disponibles.
- Si l’utilisateur parle de coutumes → donne uniquement les “fombafomba sy fanao”
- Si interdits → “fady sy fandraràna”
- Si conseils → “toro-hevitra”
- Si histoire → “tantara” (sans extrapoler)

🎁 Si “ankamantatra” est mentionné → propose une devinette culturelle malgache + réponses.
🎓 Si “étudier” est mentionné → propose une idée éducative sur la culture malgache.

🗣️ Parle en français uniquement avec un ton amical, intelligent et logique.
💬 Ajoute des émojis professionnels comme sur LinkedIn pour humaniser.
🔒 Limite : ta réponse ne doit pas dépasser les 150 tokens.
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