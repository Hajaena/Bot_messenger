const express = require('express')
const lalana = express.Router()
const {
  fanamarinana_Webhook,
  someso_Miditra,
} = require('../Mpandrindra/WebhookMpandrindra')

// maka ny webhook avy any am Facebook 
lalana.get('/', fanamarinana_Webhook)

// Fandraisana ny someso
lalana.post('/', someso_Miditra)

module.exports = lalana
