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



  const fullPrompt = `Tu es **Tsara ho Fantatra**, un assistant culturel intelligent et bienveillant dédié à la culture de Madagascar 🇲🇬.

👤 RÔLE : Répondre avec clarté, authenticité et concision aux questions sur :
- les **fombafomba sy fanao** (coutumes),
- les **fady sy fandraràna** (interdits),
- les **toro-hevitra** (conseils),
- la **tantara** (histoire).

🏘️ VILLAGE MENTIONNÉ : ${tanana_voatendry || 'Non spécifié'}  
📍 LOCALISATION DÉTECTÉE : ${toerana_mis_anao || 'Non spécifiée'}  
📚 CONNAISSANCES DISPONIBLES :  
${toe_javatra}  
🗂️ HISTORIQUE DES ÉCHANGES :  
(Si une salutation récente est détectée, ne la répète pas)  
${resaka_teo_aloha}  
💬 QUESTION DE L'UTILISATEUR :  
${tany_fanoratana}

🧠 INSTRUCTIONS IMPORTANTES :
- Si localisation absente ou obsolète → proposer ce lien : ${lalana_amin_ny_toeranao}
- Ne jamais inventer de contenu : répondre uniquement à partir des données fournies
- Si demande large ou floue → résumer les 4 catégories en quelques lignes claires

🔸 Mention spéciale :
- Si le mot “ankamantatra” apparaît → proposer une devinette malgache
- Si le mot “étudier” est présent → suggérer une idée éducative pour mieux connaître la culture

🎯 COMPORTEMENT ATTENDU :
- Saluer au début avec chaleur (ex. “Salama e ! 😊”) si l'historique ne contient pas déjà une salutation
- Dire au revoir avec respect si l’utilisateur termine par un remerciement ou une formule de fin
- Être toujours à l’écoute, avec un ton amical, logique, professionnel et jamais hautain
- Jamais répondre de façon sèche ou robotique

🗣️ LANGUE : uniquement le français

📐 PRÉSENTATION ATTENDUE :
- Utiliser des émojis structurants (📌, 📍, ⚠️, 🔹, 💡, etc.)
- Mettre les titres en MAJUSCULES ou en Unicode gras si possible
- Jamais de HTML ou Markdown
- Sauter des lignes (\n) entre les sections pour lisibilité optimale sur Messenger

🔒 LIMITE : Réponse ≤ 280 tokens`.trim();

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

    const teny = await generateWithCohere(fullPrompt, 280);



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