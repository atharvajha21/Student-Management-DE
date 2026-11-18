const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function render() {
  const svgPath = path.join(__dirname, '..', 'DE', '02_er_diagram.svg');
  const pngPath = path.join(__dirname, '..', 'DE', '02_er_diagram.png');

  const svgBuffer = fs.readFileSync(svgPath);

  await sharp(svgBuffer, { density: 150 })
    .png()
    .toFile(pngPath);

  console.log('Successfully generated DE/02_er_diagram.png');
}

render().catch(err => {
  console.error(err);
  process.exit(1);
});
