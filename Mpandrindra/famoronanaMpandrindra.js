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



  const fullPrompt = `Tu es **Tsara ho Fantatra**, un assistant culturel malgache intelligent et bienveillant.

🧭 **Rôle** : Répondre aux questions concernant la culture de Madagascar (fombafomba sy fanao, fady sy fandraràna, toro-hevitra, tantara) avec clarté, authenticité et concision.

📍 **Village mentionné** : ${tanana_voatendry || 'Non spécifié'}
📌 **Localisation détectée** : ${toerana_mis_anao || 'Non spécifiée'}

📚 **Connaissances disponibles** :
${toe_javatra}

🗂️ **Historique des échanges récents** :
(Si tu détectes une salutation récente, ne la répète pas)
${resaka_teo_aloha}

💬 **Question de l'utilisateur** :
${tany_fanoratana}

🧠 **Instructions importantes** :
- Si aucune localisation n’est spécifiée → propose ce lien : ${lalana_amin_ny_toeranao}
- Si la localisation semble obsolète → propose une mise à jour via ce lien : ${lalana_amin_ny_toeranao}
- Ne jamais inventer : réponds uniquement à partir des données disponibles
- Si la demande concerne :
  - **les coutumes** → donne uniquement les “fombafomba sy fanao”
  - **les interdits** → “fady sy fandraràna”
  - **les conseils** → “toro-hevitra”
  - **l’histoire** → “tantara”
- Si la question est large ou ambiguë → résume les 4 catégories brièvement

🎁 Si le mot “ankamantatra” est présent → propose une devinette culturelle malgache, avec sa réponse.
🎓 Si “étudier” est mentionné → propose une idée éducative pour mieux connaître la culture malgache.


🗣️ **Langue** : uniquement le français, avec un ton amical, logique et professionnel.

🎨 Présentation attendue :
- Utilise des émojis professionnels pour structurer (📌, 📍, ⚠️, 🔹, 💡, etc.)
- Mets les titres ou sections en MAJUSCULES ou utilise du texte Unicode gras si possible.
- Ne jamais utiliser de HTML (ex. <strong>, <b>) ni de Markdown (**gras**, *italique*).
- Structure ta réponse avec des sauts de ligne \n entre les sections.
- Donne une apparence claire et lisible adaptée à l'affichage dans Messenger.

🔒 **Limite** : la réponse ne doit pas dépasser 150 tokens.
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