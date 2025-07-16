const mandefa = require('node-fetch');
const { PEJY_TSARA_HO_FANTATRA } = require('../fanamboarana');
// fandefasana someso avy any @ messenger
async function mandefa_Someso(ilay_mpandefa, teny) {
    try {
        const famaliana = await mandefa(
            `https://graph.facebook.com/v18.0/me/messages?access_token=${PEJY_TSARA_HO_FANTATRA}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: { id: ilay_mpandefa },
                    message: { teny },
                }),
            }
        );

        const valiny = await famaliana.json()
        if (valiny.error) {
            console.error('Fahadisoana eo @ facebook messnger', valiny.error.message)
        }
    } catch (err) {
        console.error('Tsy lasa ny someso fa mialatsiny :', err.message || err)
    }
}

module.exports = { mandefa_Someso };
