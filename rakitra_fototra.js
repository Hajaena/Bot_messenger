// rakitra_fototra.js

require('dotenv').config();
const express = require('express');
const corsa = require('cors');
const vatana_i_parsera = require('body-parser');
const alefa = require('node-fetch');
const mamokatra_lalana_maro = require('./lalana/famokarana');
const ireo_lalan_i_Webhook = require('./lalana/webhook');
const path = require('path');

const { makaFanazavanaFanampinymombanyToeranamisyanao } = require('./servisy/servicy_toeranamisyAhy');
const { setExportedLocation } = require('./tahiry/tahiry_alefa');

const tetikasa = express();
const lavaka = process.env.PORT || 3000;


tetikasa.use(corsa());
tetikasa.use(vatana_i_parsera.json());
tetikasa.use(express.static(path.join(__dirname, 'Public')))

tetikasa.use('/generate', mamokatra_lalana_maro);
tetikasa.use('/webhook', ireo_lalan_i_Webhook);

// Fonction centralisée des boutons
function getQuickReplies() {
  return [

    { content_type: "text", title: "Interdits", payload: "INTERDITS_PAYLOAD" },
    { content_type: "text", title: "Coutumes", payload: "FOMBAFOMBA_PAYLOAD" },
    { content_type: "text", title: "Conseils ", payload: "TOROHEVITRA_PAYLOAD" },
    { content_type: "text", title: "Histoire", payload: "TANTARA_PAYLOAD" },
    { content_type: "text", title: "Etudier", payload: "HIANATRA_PAYLOAD" },
    { content_type: "text", title: "Ankamantatra", payload: "ANKAMANTATRA_PAYLOAD" }
  ];
}

const mandefa_someso_any_aminny_messenger = async (mpandray_ID, somesoSoratra, showQuickReplies = true) => {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const baseMessage = {
    text: somesoSoratra
  };
  if (showQuickReplies) {
    baseMessage.quick_replies = getQuickReplies();
  }

  const vatatena = {
    recipient: { id: mpandray_ID },
    message: baseMessage
  };

  try {
    const valinteny = await alefa(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vatatena)
    });
    const valiny = await valinteny.json();
    if (valiny.error) {
      console.error('Api misy tsy mety', valiny.error.message);
      throw new Error(valiny.error.message);
    }
  } catch (err) {
    console.error('Misy tsy mety avy any am messenger', err.message);
    throw err;
  }
};

tetikasa.post('/api/receive-location', async (fangatahana, valiny) => {
  const { senderId: ny_Mpandefa, lat: Mits, long: Mat } = fangatahana.body;

  if (!ny_Mpandefa || !Mits || !Mat) {
    return valiny.status(400).send('Misy zavatra tsy ampy o')
  }

  console.log(`Toerana voaray ${ny_Mpandefa} : Mitsangana=${Mits}, Alavana=${Mat}`)

  // ity lay fampiasana azy 
  const Toeranamisyanao = await makaFanazavanaFanampinymombanyToeranamisyanao(Mits, Mat);

  if (!Toeranamisyanao) {
    return valiny.status(500).send('Désolé, nous n\'avons pas pu déterminer précisément votre emplacement');
  }

  const Angona_Manodidina = require('./tahiry/tananaVoafantina.json');
  const nomVillage = Toeranamisyanao.Manodidina;
  const donneesVillage = Angona_Manodidina[nomVillage];
  const lalana = process.env.SERVERAN_I_NGROK
  const lalana_amin_ny_toeranao = `${lalana}/toerana_misy_ahy.html?senderId=${ny_Mpandefa}`

  let somesoSoratra = `📍 Vous êtes actuellement à ${nomVillage}. Merci pour votre confiance !\n\n`;

  if (donneesVillage && donneesVillage['fady sy fandraràna'] && donneesVillage['fady sy fandraràna'].length > 0) {
    somesoSoratra += `⚠️ **Interdits (Fady) à respecter :**\n`;
    donneesVillage['fady sy fandraràna'].forEach((fady, index) => {
      somesoSoratra += `${index + 1}. ${fady}\n`;
    });
    somesoSoratra += `\n✨ Qu'aimeriez-vous découvrir d'autre à propos de ce lieu ?\n`;
  } else {
    somesoSoratra += `✨ Qu'aimeriez-vous découvrir à propos de ce lieu ?\n
    Voici quelques suggestions 🥹
    `;
  }

  const somesoSoratraTsymisytoerana = `Vous êtes dans un lieu inconnu 😢. Merci de réessayer pour que je puisse trouver votre position.

Voici le lien : ${lalana_amin_ny_toeranao}
`;


  try {
    if (Toeranamisyanao.Manodidina !== 'inconnu') {
      await mandefa_someso_any_aminny_messenger(ny_Mpandefa, somesoSoratra, true);
      valiny.status(200).send("Votre position a bien été reçue, merci beaucoup");
      console.log(Toeranamisyanao.Manodidina)
      setExportedLocation(ny_Mpandefa, Toeranamisyanao.Manodidina)
    } else {
      await mandefa_someso_any_aminny_messenger(ny_Mpandefa, somesoSoratraTsymisytoerana, false);
      valiny.status(200).send("Votre position n'a pas pu être déterminée précisément.");
    }

  } catch (err) {
    console.error('Il y a un problème pour récupérer votre position', err.message);
    valiny.status(200).send("Votre position ne nous est pas parvenue, veuillez la renvoyer s'il vous plaît.");
  }
});

tetikasa.get('/ping', (req, res) => {
  res.status(200).send('✅ Serveur Tsara ho Fantatra est bien réveillé');
});

tetikasa.listen(lavaka, () => {
  console.log(`🥹 Tsara ho Fantatra dia mande ao amin'ny lavaka http://localhost:${lavaka}`);
});

module.exports = {
  mandefa_someso_any_aminny_messenger
};