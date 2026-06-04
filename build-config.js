const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const socketUrl = process.env.SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL || '';
const content = `window.SOCKET_URL = '${socketUrl.replace(/'/g, "\\'")}';`;
fs.writeFileSync(path.join(outDir, 'config.js'), content, 'utf8');
console.log('Wrote public/config.js with SOCKET_URL=', socketUrl || '(empty)');
