require('dotenv').config()
const mandefa = require('node-fetch');
const { VERIFY_TOKEN, PAGE_ACCESS_TOKEN } = require('../fanamboarana')
const link = process.env.SERVERAN_I_NGROK

const tafatafa = {};

// ✅ SYSTÈME DE DÉDUPLICATION - NOUVEAU
const messagesTraites = new Map();
const messagesEnCours = new Set();
const DUREE_CACHE = 5 * 60 * 1000; // 5 minutes

// Nettoyer automatiquement le cache toutes les minutes
setInterval(() => {
  const maintenant = Date.now();
  let compteur = 0;
  for (const [id, timestamp] of messagesTraites.entries()) {
    if (maintenant - timestamp > DUREE_CACHE) {
      messagesTraites.delete(id);
      compteur++;
    }
  }
  if (compteur > 0) {
    console.log(`🧹 Cache nettoyé: ${compteur} messages supprimés`);
  }
}, 60000);

// Vérifier si un message a déjà été traité
function messageDejaTraite(messageId) {
  if (messagesTraites.has(messageId)) {
    console.log(`⏭️  Message ${messageId} DÉJÀ TRAITÉ - IGNORÉ`);
    return true;
  }
  messagesTraites.set(messageId, Date.now());
  return false;
}

// Vérifier si un message est en cours de traitement
function estEnCoursDeTraitement(cle) {
  if (messagesEnCours.has(cle)) {
    console.log(`⏳ Message EN COURS: ${cle} - IGNORÉ`);
    return true;
  }
  messagesEnCours.add(cle);
  return false;
}

// Libérer un message en cours
function libererMessage(cle) {
  messagesEnCours.delete(cle);
}

async function fanamarinana_Webhook(Fangatahana, valiny) {
  const maody = Fangatahana.query['hub.mode']
  const teny_maro = Fangatahana.query['hub.verify_token']
  const fifaninanana = Fangatahana.query['hub.challenge']

  if (maody === 'subscribe' && teny_maro === VERIFY_TOKEN) {
    console.log('✅ Webhook vérifié avec succès')
    valiny.status(200).send(fifaninanana)
  } else {
    console.warn('❌ Échec de vérification webhook')
    valiny.sendStatus(403);
  }
}

async function someso_Miditra(fangatahana, valiny) {
  const vatana = fangatahana.body;

  // ✅ RÉPONDRE IMMÉDIATEMENT à Facebook (très important!)
  valiny.status(200).send('EVENT_RECEIVED');

  if (vatana.object !== 'page') {
    console.log('⚠️  Objet non-page, ignoré');
    return;
  }

  console.log('\n📨 ====== WEBHOOK REÇU ======');

  for (const mampiditra of vatana.entry) {
    const lanonana_webhook = mampiditra.messaging[0];

    if (!lanonana_webhook) continue;

    const ny_mpandefa = lanonana_webhook.sender?.id;

    if (!ny_mpandefa) {
      console.log('⚠️  Pas de sender ID, ignoré');
      continue;
    }

    // ✅ DÉDUPLICATION PAR MESSAGE ID
    const messageId = lanonana_webhook.message?.mid ||
      lanonana_webhook.postback?.mid ||
      `${ny_mpandefa}_${lanonana_webhook.timestamp}`;

    if (messageDejaTraite(messageId)) {
      console.log('🔄 Message dupliqué détecté et ignoré');
      continue; // Passer au message suivant
    }

    if (lanonana_webhook.message && lanonana_webhook.message.text) {
      const tany_fisoratana = lanonana_webhook.message.text;

      // ✅ CLÉ UNIQUE pour éviter le double traitement
      const cleUnique = `${ny_mpandefa}_${tany_fisoratana.substring(0, 50)}_${Date.now()}`;

      if (estEnCoursDeTraitement(cleUnique)) {
        console.log('🔄 Message déjà en traitement, ignoré');
        continue;
      }

      console.log(`\n📝 Message de ${ny_mpandefa}: "${tany_fisoratana}"`);

      try {
        // ✅ Envoyer le message avec bouton lors de la première interaction
        if (!tafatafa[ny_mpandefa]) {
          const lalana = process.env.SERVERAN_I_NGROK
          const lalana_amin_ny_toeranao = `${lalana}/toerana_misy_ahy.html?senderId=${ny_mpandefa}`;
          await mandefaAvecBouton(ny_mpandefa, lalana_amin_ny_toeranao)
        }

        tafatafa[ny_mpandefa] = tafatafa[ny_mpandefa] || [];
        tafatafa[ny_mpandefa].push({ role: 'user', contenue: tany_fisoratana });
        const history = tafatafa[ny_mpandefa].slice(-10);

        const valinteny = await mandefa(`${link}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tany_fanoratana: tany_fisoratana,
            messages: history,
            senderId: ny_mpandefa
          }),
        });

        console.log('📤 Requête envoyée: ', tany_fisoratana)
        const tahiry = await valinteny.json()
        console.log('📥 Réponse serveur:', tahiry)

        // Si bouton envoyé, ne pas envoyer de message texte
        if (tahiry.success && tahiry.action === 'bouton_envoye') {
          console.log('✅ Bouton envoyé, pas de texte');
          libererMessage(cleUnique);
          continue;
        }

        if (tahiry.success && tahiry.action === 'image_generee') {
          console.log('✅ Image générée et envoyée');
          libererMessage(cleUnique);
          continue;
        }

        if (tahiry.hasButtonAdded) {
          console.log('✅ Bouton auto ajouté, message déjà envoyé');
          libererMessage(cleUnique);
          continue;
        }

        const teny = tahiry.result || ""

        if (teny.trim()) {
          tafatafa[ny_mpandefa].push({ role: 'assistant', contenue: teny })
          await mandefaSomeso(ny_mpandefa, teny)
        }

      } catch (err) {
        console.error('❌ Erreur traitement:', err.message)
      } finally {
        // ✅ TOUJOURS libérer le message après traitement
        libererMessage(cleUnique);
      }
    }
  }
}

// ✅ Fonction pour envoyer un message simple
async function mandefaSomeso(ny_mpandray, teny) {
  if (!teny || teny.trim() === '') {
    console.log('⚠️  Message vide, non envoyé');
    return;
  }

  try {
    const valiny = await mandefa(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: ny_mpandray },
          message: { text: teny },
        }),
      }
    );

    const valinteny = await valiny.json()

    if (valinteny.error) {
      console.error('❌ Erreur Messenger:', `(#${valinteny.error.code})`, valinteny.error.message)
    } else {
      console.log('✅ Message texte envoyé')
    }
  } catch (err) {
    console.error('❌ Erreur envoi message:', err.message)
  }
}

async function mandefaAvecBouton(ny_mpandray, lalana_amin_ny_toeranao) {
  try {
    const valiny = await mandefa(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: ny_mpandray },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "button",
                text: "Nous vous invitons à partager votre localisation afin que vous puissiez recevoir toute l'aide disponible ☺️",
                buttons: [
                  {
                    type: "web_url",
                    url: lalana_amin_ny_toeranao,
                    title: "📍 Partager ma position"
                  }
                ]
              }
            }
          }
        }),
      }
    );

    const valinteny = await valiny.json()

    if (valinteny.error) {
      console.error('❌ Erreur bouton:', valinteny.error.message)
    } else {
      console.log('✅ Message avec bouton envoyé')
    }
  } catch (err) {
    console.error('❌ Erreur envoi bouton:', err.message)
  }
}

module.exports = {
  fanamarinana_Webhook,
  someso_Miditra,
};