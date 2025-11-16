
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

/**
 * Génère une image avec Pollinations.AI (gratuit, sans token)
 * @param {string} prompt - Description de l'image à générer
 * @param {object} options - Options de génération
 * @returns {Promise<Buffer>} Image générée en format buffer
 */
async function genererImageAvecFlux(prompt, options = {}) {
    const {
        width = 1024,
        height = 1024,
        timeout = 30000, // 30 secondes (plus rapide)
        model = 'flux' // Modèles disponibles: 'flux', 'turbo', 'flux-realism'
    } = options;

    console.log(`🎨 Génération d'image avec Pollinations.AI (${model})...`);
    console.log(`📝 Prompt: "${prompt}"`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        // Encoder le prompt pour l'URL
        const encodedPrompt = encodeURIComponent(prompt);

        // URL de l'API Pollinations (gratuite et sans authentification)
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true`;

        console.log(`🔗 URL: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Erreur API Pollinations: ${response.status} - ${response.statusText}`);
        }

        // L'image est retournée directement
        const imageBuffer = await response.buffer();

        console.log(`✅ Image générée (${imageBuffer.length} bytes)`);

        return imageBuffer;

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Timeout: La génération a pris trop de temps');
        }

        console.log('⚠️ Pollinations échoué, tentative avec API de secours...');
        return await genererImageSecours(prompt, { width, height });
    }
}

/**
 * API de secours : Utilise Replicate (gratuit avec limite)
 */
async function genererImageSecours(prompt, options = {}) {
    const { width = 1024, height = 1024 } = options;

    console.log('🔄 Utilisation de l\'API de secours...');

    // Alternative : API Segmind (gratuite mais limitée)
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://api.segmind.com/v1/sd-generate?prompt=${encodedPrompt}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            timeout: 30000
        });

        if (response.ok) {
            const imageBuffer = await response.buffer();
            console.log(`✅ Image générée avec l'API de secours (${imageBuffer.length} bytes)`);
            return imageBuffer;
        }
    } catch (err) {
        console.error('❌ API de secours échouée:', err.message);
    }

    // Si tout échoue, retourner une erreur claire
    throw new Error('Toutes les API de génération d\'images sont indisponibles. Réessayez plus tard.');
}

/**
 * Génère une image et la sauvegarde localement
 */
async function genererEtSauvegarderImage(prompt, outputPath = null) {
    const imageBuffer = await genererImageAvecFlux(prompt);

    const timestamp = Date.now();
    const filename = outputPath || path.join(__dirname, `../images/pollinations_${timestamp}.png`);

    const dir = path.dirname(filename);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filename, imageBuffer);

    console.log(`💾 Image sauvegardée: ${filename}`);

    return filename;
}

/**
 * Détecte si l'utilisateur demande une génération d'image
 */
function demandeGenerationImage(texte) {
    const patterns = [
        /\bcr[ée]e.*image\b/i,
        /\bcr[ée]er.*image\b/i,
        /\bg[ée]n[ée]re.*image\b/i,
        /\bfais.*image\b/i,
        /\bdessin.*moi\b/i,
        /\billustration\b/i,
        /\bimage de\b/i,
        /\bphoto de\b/i,
        /\bmontre.*moi\b/i,
        /\bpeindre\b/i,
        /\bdessiner\b/i,
        /\bmamorona.*sary\b/i,
        /\bmanamboara.*sary\b/i,
        /\bmanaova.*sary\b/i
    ];

    return patterns.some(pattern => pattern.test(texte));
}

/**
 * Extrait et améliore le prompt de génération d'image
 */
function extrairePromptImage(texte) {
    // Retirer les mots de commande
    let prompt = texte
        .replace(/\b(cr[ée]e|cr[ée]er|g[ée]n[ée]re|fais|dessine|montre|image|photo|de|d'|une?|le|la|du|l')\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!prompt || prompt.length < 3) {
        prompt = texte;
    }
    prompt = `${prompt}, par Tsara ho fantatra.`;
    return prompt;
}

/**
 * Traduire automatiquement en anglais pour de meilleurs résultats (optionnel)
 */
function traduirePromptEnAnglais(prompt) {
    // Traductions simples courantes
    const traductions = {
        'paysage': 'landscape',
        'baobab': 'baobab tree',
        'village': 'village',
        'coucher de soleil': 'sunset',
        'plage': 'beach',
        'montagne': 'mountain',
        'forêt': 'forest',
        'culture': 'culture',
        'tradition': 'tradition'
    };

    let promptAnglais = prompt;
    Object.keys(traductions).forEach(fr => {
        const regex = new RegExp(`\\b${fr}\\b`, 'gi');
        promptAnglais = promptAnglais.replace(regex, traductions[fr]);
    });

    return promptAnglais;
}

module.exports = {
    genererImageAvecFlux,
    genererEtSauvegarderImage,
    demandeGenerationImage,
    extrairePromptImage,
    traduirePromptEnAnglais
};