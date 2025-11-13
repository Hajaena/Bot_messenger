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
// Après la fonction veutAnkamantatra
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

  // 🆕 Contexte de conversation plus concis (seulement 5 derniers messages)
  const resaka_teo_aloha = tahiry
    .slice(-4)
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
Tu es **Tsara ho Fantatra**, un assistant culturel malgache sur Messenger.

Ta mission :
- Expliquer simplement la culture malgache (coutumes, fombafomba, fady, histoires, conseils).
- Adapter tes réponses au village de l’utilisateur quand il est connu.
- Parler de façon naturelle, chaleureuse et concise.

### Contexte utilisateur

- Village détecté : ${tanana_voatendry || 'aucun'}
- Localisation partagée : ${toerana_mis_anao || 'aucune'}

${toe_javatra ? `### Données culturelles disponibles pour ce village

${toe_javatra}
` : ''}

${resaka_teo_aloha ? `### Historique récent de la conversation
${resaka_teo_aloha}
` : ''}

### Message de l’utilisateur
"${tany_fanoratana}"

---

### RÈGLES GÉNÉRALES

1. Langue :
   - Réponds principalement en malgache simple.
   - Tu peux ajouter une courte phrase de clarification en français si utile.
2. Ton :
   - Ton amical, comme un ami qui explique.
   - 1 à 2 émojis maximum.
3. Longueur :
   - Réponse normale : 2–3 phrases.
   - Si l’utilisateur demande “plus de détails”, tu peux aller jusqu’à 8–10 phrases.
4. Ne répète pas ce qui est déjà clairement expliqué dans ta réponse précédente.

---

### CAS SPÉCIAUX À GÉRER

${!tanana_voatendry && !toerana_mis_anao ? `
▶ CAS 1 : aucune localisation connue
- Tu dois commencer par dire que tu n’as pas encore sa localisation.
- Propose le lien suivant : ${lalana_amin_ny_toeranao}
- Propose aussi qu’il te dise directement le nom du village.
- Ensuite, donne une réponse générale sur la culture malgache liée à sa question.
` : ''}

${cestUneSalutation && !dejaSalue ? `
▶ CAS 2 : simple salutation
- Réponds très brièvement :
  Exemple : "Salama 😊 Inona no azoko anampiana anao momba ny kolontsaina malagasy ?"
- Ne fais rien d’autre dans ce message.
` : ''}

${demandeAnkamantatra ? `
▶ CAS 3 : l’utilisateur veut une devinette (ankamantatra)
- Propose UNE seule devinette malgache.
- Si des données de village existent, inspire-toi-en, sinon reste général.
- NE DONNE PAS la réponse.
- Format :
  "Ity misy ankamantatra iray : [devinette en malgache] 🤔
   Fantatrao ve ny valiny ? Lazao ahy aloha, na soraty hoe 'réponse' raha te-hahafantatra ianao."
` : ''}

${demandeReponseAnkamantatra ? `
▶ CAS 4 : l’utilisateur demande la réponse à la devinette
- Donne la réponse, puis une courte explication culturelle (1–2 phrases).
- Format :
  "Valiny : [réponse en malgache] ✨
   [explication courte en français ou malgache]."
` : ''}

${demandeHianatra ? `
▶ CAS 5 : l’utilisateur veut apprendre (mode apprentissage)
- Propose un petit "cours" simple sur un thème culturel (fombafomba, fady, fomba fiarahabana, etc.).
- Structure :
  1) Explication courte
  2) Exemple concret
  3) Petite question pour l’encourager à continuer.
` : ''}

${veutDetails && !demandeAnkamantatra && !demandeHianatra ? `
▶ CAS 6 : l’utilisateur veut plus de détails
- Donne une explication plus complète (8–10 phrases maximum).
` : ''}

${!toe_javatra && tanana_voatendry ? `
▶ CAS 7 : village connu mais pas dans la base
- Explique que tu n’as pas encore d’infos précises sur ce village.
- Invite l’utilisateur à contribuer plus tard.
- Propose le lien : ${lalana_amin_ny_toeranao}
- Donne quand même une réponse générale sur la culture de la région ou de Madagascar.
` : ''}

---

Maintenant, rédige directement la meilleure réponse pour l’utilisateur, sans expliquer ta logique interne.
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