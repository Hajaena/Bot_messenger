require('dotenv').config()
const mandefa = require('node-fetch');
const { VERIFY_TOKEN, PAGE_ACCESS_TOKEN } = require('../fanamboarana')
const link = process.env.SERVERAN_I_NGROK

const tafatafa = {}; // BDD messenger

async function fanamarinana_Webhook(Fangatahana, valiny) {
  const maody = Fangatahana.query['hub.mode']
  const teny_maro = Fangatahana.query['hub.verify_token']
  const fifaninanana = Fangatahana.query['hub.challenge']

  if (maody === 'subscribe' && teny_maro === VERIFY_TOKEN) {
    console.log('Mande i Webhook')
    valiny.status(200).send(fifaninanana)
  } else {
    console.warn('Tsy nety ny fanamarinana i webhook e')
    valiny.sendStatus(403);
  }
}

async function someso_Miditra(fangatahana, valiny) {
  const vatana = fangatahana.body;

  if (vatana.object === 'page') {
    for (const mampiditra of vatana.entry) {
      const lanonana_webhook = mampiditra.messaging[0];
      const ny_mpandefa = lanonana_webhook.sender.id;

      if (lanonana_webhook.message && lanonana_webhook.message.text) {
        const tany_fisoratana = lanonana_webhook.message.text

        // ✅ Envoyer le message avec bouton lors de la première interaction
        if (!tafatafa[ny_mpandefa]) {
          const lalana = process.env.SERVERAN_I_NGROK
          const lalana_amin_ny_toeranao = `${lalana}/toerana_misy_ahy.html?senderId=${ny_mpandefa}`;

          await mandefaAvecBouton(ny_mpandefa, lalana_amin_ny_toeranao)
        }

        tafatafa[ny_mpandefa] = tafatafa[ny_mpandefa] || [];
        tafatafa[ny_mpandefa].push({ role: 'user', contenue: tany_fisoratana });
        const history = tafatafa[ny_mpandefa].slice(-10);

        try {
          const valinteny = await mandefa(`${link}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tany_fanoratana: tany_fisoratana, messages: history, senderId: ny_mpandefa }),
          });
          console.log('Ataka : ', tany_fisoratana)
          const tahiry = await valinteny.json()

          // ✅ CORRECTION: Vérifier si c'est une action spéciale (bouton envoyé)
          if (tahiry.success && tahiry.action === 'bouton_envoye') {
            console.log('✅ Bouton de localisation envoyé, pas de message texte à envoyer');
            // Ne rien faire, le bouton a déjà été envoyé par famokaranaMpandrindra
            continue; // Passer à l'événement suivant
          }

          // ✅ CORRECTION: Vérifier si hasButtonAdded est true
          if (tahiry.hasButtonAdded) {
            console.log('✅ Bouton automatique ajouté, message déjà envoyé');
            // Le message et le bouton ont déjà été envoyés par famokaranaMpandrindra
            continue; // Passer à l'événement suivant
          }

          const teny = tahiry.result || "Vous avez atteint la limite ☹️.\nVeuillez réessayer plus tard."
          console.log('Valinteny avy any @ server:', tahiry)

          // manampy ny bot ami'ny hevitra taloha
          tafatafa[ny_mpandefa].push({ role: 'assistant', contenue: teny })

          await mandefaSomeso(ny_mpandefa, teny)
        } catch (err) {
          console.error('Fahadisoana', err)
        }
      }
    }

    valiny.status(200).send('EVENT_RECEIVED')
  } else {
    valiny.sendStatus(404);
  }
}
// ✅ Fonction pour envoyer un message simple
async function mandefaSomeso(ny_mpandray, teny) {
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
      console.error('Nanao fahadisoana i Faseboky', valinteny.error.message)
    }
  } catch (err) {
    console.error('Nisy fahadisoana taminy', err)
  }
}

// ✅ NOUVELLE FONCTION: Envoyer un message avec bouton (lien caché)
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
      console.error('Nanao fahadisoana i Faseboky', valinteny.error.message)
    } else {
      console.log('✅ Message avec bouton envoyé avec succès')
    }
  } catch (err) {
    console.error('Nisy fahadisoana taminy', err)
  }
}

module.exports = {
  fanamarinana_Webhook,
  someso_Miditra,
};