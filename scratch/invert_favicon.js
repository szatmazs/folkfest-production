const sharp = require('sharp');
const path = require('path');

async function invertFavicon() {
    const inputPath = path.join(process.cwd(), 'public/favicon.png');
    const outputPath = path.join(process.cwd(), 'public/favicon_black.png');
    
    try {
        await sharp(inputPath)
            .negate({ alpha: false }) // Invert colors but keep alpha
            .toFile(outputPath);
        console.log('Favicon inverted successfully');
    } catch (err) {
        console.error('Error inverting favicon:', err);
    }
}

invertFavicon();
