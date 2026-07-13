const fs = require('fs');
let code = fs.readFileSync('next.config.mjs', 'utf-8');
if (!code.includes('output: "standalone"')) {
  code = code.replace('const nextConfig = {', 'const nextConfig = {\n  output: "standalone",');
  fs.writeFileSync('next.config.mjs', code);
}
