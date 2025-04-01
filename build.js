// Build script for production optimization
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting production build process...');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

try {
    // Clean previous build
    console.log('🧹 Cleaning previous build...');
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }

    // Run the Vite build
    console.log('🔨 Building application...');
    execSync('npx vite build', { stdio: 'inherit' });

    // Copy necessary files to dist
    console.log('📁 Copying static assets...');
    fs.copyFileSync('README.md', path.join('dist', 'README.md'));

    // Create version file
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const versionInfo = {
        version: packageJson.version,
        buildDate: new Date().toISOString(),
        name: packageJson.name
    };
    fs.writeFileSync(path.join('dist', 'version.json'), JSON.stringify(versionInfo, null, 2));

    // Create .htaccess for Apache servers (SPA routing)
    const htaccess = `
# Enable rewriting
RewriteEngine On

# If the requested file or directory doesn't exist
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Rewrite all requests to index.html
RewriteRule ^ index.html [QSA,L]

# Set cache control headers for static assets
<FilesMatch "\\.(ico|pdf|jpg|jpeg|png|webp|gif|html|htm|xml|txt|xsl|css)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

<FilesMatch "\\.(js)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

# Disable caching for service worker
<FilesMatch "sw\\.js$">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>
`;
    fs.writeFileSync(path.join('dist', '.htaccess'), htaccess);

    // Create a web.config file for IIS servers
    const webConfig = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
      <mimeMap fileExtension=".glb" mimeType="model/gltf-binary" />
    </staticContent>
  </system.webServer>
</configuration>`;
    fs.writeFileSync(path.join('dist', 'web.config'), webConfig);

    console.log('✅ Build completed successfully! Production-ready files are in the dist/ directory.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test the production build locally: npx vite preview');
    console.log('2. Deploy the contents of the dist/ directory to your production server');
    console.log('3. For optimal performance, configure your server for HTTP/2 and HTTPS');

} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
} 