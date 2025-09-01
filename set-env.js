const fs = require('fs');
const path = require('path');

// Solo cargar .env si no se está en CI
if (!process.env.CI) {
  require('dotenv').config();
}

try {
  const envFiles = [
    'environment.ts',
    'environment.development.ts',
    'environment.production.ts',
  ];

  envFiles.forEach((fileName) => {
    try {
      const targetPath = path.resolve(__dirname, `./src/environments/${fileName}`);

      if (!fs.existsSync(targetPath)) {
        throw new Error(`El archivo no existe: ${targetPath}`);
      }

      const captcha_site_key = process.env['CAPTCHA_SITE_KEY'];

      if (!captcha_site_key) {
        throw new Error(`Variable captcha_site_key no definida`);
      }

      let fileContent = fs.readFileSync(targetPath, { encoding: 'utf8' });

      fileContent = fileContent.replace(/CAPTCHA_SITE_KEY:\s*'[^']*'/, `CAPTCHA_SITE_KEY: '${captcha_site_key}'`);

      fs.writeFileSync(targetPath, fileContent, { encoding: 'utf8' });

      console.log(`✅ captcha_site_key = ${captcha_site_key}`);
    } catch (error) {
      console.error(`❌ Error al actualizar ${fileName}: ${error.message}`);
    }
  });
} catch (error) {
  console.error(`❌ Error al actualizar captcha_site_key: ${error.message}`);
}