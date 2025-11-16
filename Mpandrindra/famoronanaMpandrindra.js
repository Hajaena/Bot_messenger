// famokaranaMpandrindra.js - VERSION CORRIGÉE
require('dotenv').config()
const { genererAvecFallback } = require('../fanamboarana/mamokatraMiarakaFallback');
const Angona_Manodidina = require('../tahiry/tananaVoafantina.json');
const { tenyNatoraly } = require('../miasa_matetika/fanatsaranaTeny');
const { getExportedLocation } = require('../tahiry/tahiry_alefa');
const fetch = require('node-fetch');
const { getHistorique, saveMessage } = require('../tahiry/memoire')
const {
  genererImageAvecFlux,
  demandeGenerationImage,
  extrairePromptImage
} = require('../fanamboarana/huggingface_image');

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

// ✅ FONCTION CORRIGÉE: Envoyer une image via Messenger
async function envoyerImage(senderId, imageBuffer, caption = null) {
  const FormData = require('form-data');

  // Si caption existe, l'envoyer d'abord comme message texte séparé
  if (caption) {
    callSendAPI({
      recipient: { id: senderId },
      message: { text: caption }
    });

    // Attendre un peu avant d'envoyer l'image
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Puis envoyer l'image seule
  const form = new FormData();
  form.append('recipient', JSON.stringify({ id: senderId }));
  form.append('message', JSON.stringify({
    attachment: {
      type: "image",
      payload: {}
    }
  }));
  form.append('filedata', imageBuffer, {
    filename: 'image.png',
    contentType: 'image/png'
  });

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Image envoyée avec succès:', result);
      return result;
    } else {
      console.error('❌ Erreur envoi image:', result);
      throw new Error(result.error?.message || 'Erreur lors de l\'envoi de l\'image');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'image:', error);
    throw error;
  }
}

// Envoyer un message avec bouton de localisation
function envoyerMessageAvecBoutonLocalisation(senderId, texteMessage, lienLocalisation) {
  const body = {
    recipient: { id: senderId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: texteMessage,
          buttons: [
            {
              type: "web_url",
              url: lienLocalisation,
              title: "📍 Partager ma position",
              webview_height_ratio: "tall"
            }
          ]
        }
      }
    }
  };

  fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(json => console.log('✅ Message avec bouton envoyé:', json))
    .catch(err => console.error('❌ Erreur envoi bouton:', err));
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

// Détecter les demandes de localisation
function demandeLocalisation(texte) {
  const patterns = [
    /\blocalisation\b/i,
    /\bposition\b/i,
    /\bma position\b/i,
    /\boù je suis\b/i,
    /\blieu\b/i,
    /\btoerana\b/i,
    /\bpartager.*position\b/i,
    /\bpartager.*localisation\b/i,
    /\benvoyer.*position\b/i,
    /\blien\b/i
  ];
  return patterns.some(pattern => pattern.test(texte));
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

  if (demandeGenerationImage(tany_fanoratana)) {
    console.log('🎨 Demande de génération d\'image détectée');

    try {
      callSendAPI({
        recipient: { id: senderId },
        message: { text: "Création de votre image..." }
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      callSendAPI({
        recipient: { id: senderId },
        sender_action: "typing_on"
      });

      const promptImage = extrairePromptImage(tany_fanoratana);
      console.log('📝 Prompt image:', promptImage);

      const imageBuffer = await genererImageAvecFlux(promptImage);

      // ✅ CORRECTION: Envoyer l'image avec le caption
      await envoyerImage(
        senderId,
        imageBuffer,
        `${promptImage} J'espère que cela vous plaît ! 🥹🥰`
      );

      // Sauvegarder dans l'historique
      saveMessage(senderId, 'user', tany_fanoratana);
      saveMessage(senderId, 'assistant', `[Image générée: ${promptImage}]`);

      return valiny.status(200).json({
        success: true,
        action: 'image_generee',
        prompt: promptImage
      });

    } catch (error) {
      console.error('❌ Erreur génération image:', error);

      let messageErreur = "Désolé, je n'ai pas pu générer l'image. ";

      // Gérer le cas spécifique du chargement avec temps d'attente
      if (error.message.includes('en cours de chargement')) {
        const match = error.message.match(/en cours de chargement\|(\d+)/);
        const waitTime = match ? match[1] : '30';
        messageErreur = `🔄 Le modèle se réveille... Réessayez dans ${waitTime} secondes. ⏳`;
      } else if (error.message.includes('Timeout')) {
        messageErreur += "La génération a pris trop de temps, réessayez. ⏱️";
      } else if (error.message.includes('HUGGINGFACE_TOKEN')) {
        messageErreur = "⚠️ Configuration manquante. Contactez l'administrateur.";
      } else {
        messageErreur += "Une erreur technique est survenue. Réessayez dans quelques instants. 🙏";
      }

      callSendAPI({
        recipient: { id: senderId },
        message: { text: messageErreur }
      });

      return valiny.status(500).json({
        error: 'Erreur génération image',
        details: error.message
      });
    }
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

  const lalana = process.env.SERVERAN_I_NGROK
  const lalana_amin_ny_toeranao = `${lalana}/toerana_misy_ahy.html?senderId=${senderId}`

  const demandeLien = demandeLocalisation(tany_fanoratana);

  if (demandeLien) {
    console.log('🔗 Demande de localisation détectée');

    // Message explicatif
    const messageExplicatif = toerana_mis_anao
      ? `Vous êtes actuellement à ${toerana_mis_anao}. 📍\n\nSi vous souhaitez mettre à jour votre position, cliquez sur le bouton ci-dessous :`
      : `Pour que je puisse vous fournir des informations précises sur les coutumes et interdits de votre région, partagez votre position en cliquant sur le bouton ci-dessous :`;

    // Afficher l'indicateur "typing"
    callSendAPI({
      recipient: { id: senderId },
      sender_action: "typing_on"
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    envoyerMessageAvecBoutonLocalisation(senderId, messageExplicatif, lalana_amin_ny_toeranao);

    saveMessage(senderId, 'user', tany_fanoratana);
    saveMessage(senderId, 'assistant', messageExplicatif + ' [Bouton: Partager ma position]');

    return valiny.status(200).json({ success: true, action: 'bouton_envoye' });
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

  const resaka_teo_aloha = tahiry
    .slice(-8)
    .map(someso =>
      someso.role === 'user'
        ? `User: ${someso.contenue}`
        : `Tsara: ${someso.contenue}`
    )
    .join('\n');

  const fullPrompt = `Tu es Tsara ho Fantatra, assistant culturel malgache chaleureux et compétent pour les touristes et surtout pour les jeunes malgaches qui souhaite approfondire ces connaissances à ses propres cultures.

CONTEXTE
${tanana_voatendry && 'Village :' + tanana_voatendry}
Localisation : ${toerana_mis_anao || 'non précisée'}
${!tanana_voatendry && !toerana_mis_anao ?
      `Aucune localisation détectée.` : ''}

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
      `- Aucune donnée pour "${tanana_voatendry}", invite l'utilisateur à partager sa position pour obtenir des infos précises\n` : ''}
${!toerana_mis_anao ?
      `- Si l'utilisateur te demande des infos locales mais n'a pas partagé sa position, invite-le gentiment à partager sa localisation\n` : ''}
      
Donne les réponses que tu connais meme si elles ne sont pas dans les données.

STYLE
- Ton naturel et conversationnel
- Base-toi uniquement sur les données fournies
- Ne répète pas les infos de l'historique
- 6 émojis maximum
- IMPORTANT: Ne mentionne JAMAIS de lien URL dans ta réponse. Si tu dois parler de localisation, dis juste "vous pouvez partager votre position"

IMAGE
- Tu peux générer une image si l'utilisateur le demande. Il suffit juste de lui demander gentiment de préciser son idée d'image

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

    console.log('🔄 Génération avec fallback Gemini → HuggingFace → Cohere...');
    const teny = await genererAvecFallback(fullPrompt);

    saveMessage(senderId, 'user', tany_fanoratana);
    saveMessage(senderId, 'assistant', teny);

    const mentionneLocalisation = /partager.*position|partager.*localisation|votre position|votre localisation/i.test(teny);

    if (mentionneLocalisation && !toerana_mis_anao) {
      console.log('📍 Ajout automatique du bouton de localisation');

      callSendAPI({
        recipient: { id: senderId },
        message: { text: teny }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      envoyerMessageAvecBoutonLocalisation(
        senderId,
        "Cliquez sur le bouton ci-dessous pour partager votre position :",
        lalana_amin_ny_toeranao
      );

      return valiny.status(200).json({ success: true, result: teny, hasButtonAdded: true });
    } else {
      setTimeout(() => {
        valiny.json({ result: teny });
      }, Math.min(teny.length * 8, 1200));
    }
  } catch (err) {
    console.error('❌ ERREUR CRITIQUE: Tous les modèles ont échoué:', err);

    const messageErreur = "Désolé, je rencontre un problème technique temporaire. Pouvez-vous réessayer dans quelques instants ? 🙏";

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