// test_pollinations.js
// Test rapide de la génération d'images avec Pollinations.AI

require('dotenv').config();
const {
    genererEtSauvegarderImage,
    demandeGenerationImage,
    extrairePromptImage
} = require('./fanamboarana/huggingface_image');

async function testRapide() {
    console.log('🧪 === TEST POLLINATIONS.AI ===\n');

    // Test 1: Détection
    console.log('📋 Test 1: Détection de demandes\n');
    const phrases = [
        "Créer une image de bob l'éponge",
        "Génère un paysage malgache",
        "Bonjour comment vas-tu?"
    ];

    phrases.forEach(phrase => {
        const detected = demandeGenerationImage(phrase);
        const prompt = extrairePromptImage(phrase);
        console.log(`"${phrase}"`);
        console.log(`  Détection: ${detected ? '✅' : '❌'}`);
        if (detected) console.log(`  Prompt: "${prompt}"`);
        console.log();
    });

    // Test 2: Génération réelle
    console.log('📋 Test 2: Génération d\'image\n');

    const testPrompts = [
        "spongebob squarepants cartoon character",
        "baobab tree at sunset in Madagascar"
    ];

    for (const prompt of testPrompts) {
        try {
            console.log(`🎨 Génération: "${prompt}"`);
            console.log('⏳ Patientez...\n');

            const start = Date.now();
            const file = await genererEtSauvegarderImage(prompt);
            const duration = ((Date.now() - start) / 1000).toFixed(1);

            console.log(`✅ Succès en ${duration}s`);
            console.log(`📁 Fichier: ${file}\n`);

        } catch (error) {
            console.error(`❌ Erreur: ${error.message}\n`);
        }
    }

    console.log('✅ Tests terminés !');
}

testRapide().catch(err => {
    console.error('❌ ERREUR:', err);
    process.exit(1);
});