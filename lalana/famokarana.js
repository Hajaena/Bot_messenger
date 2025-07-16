const express = require('express')
const routera = express.Router()
const { Mamokatra } = require('../Mpandrindra/famoronanaMpandrindra')

routera.post('/', Mamokatra)
module.exports = routera
