// Next.js başlatma wrapper'ı - Plesk için
const { spawn } = require('child_process');

const PORT = process.env.PORT || 4049;

console.log(`🚀 Starting Next.js on port ${PORT}...`);
console.log(`📌 NODE_ENV: ${process.env.NODE_ENV}`);

// next start -p <PORT> komutu
const child = spawn('npx', ['next', 'start', '-p', PORT], { 
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Next.js exited with code ${code}`);
  process.exit(code);
});

