import { spawn } from 'node:child_process';
const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'install', '--only-shell', 'chromium'], { stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '.cache/playwright' } });
child.on('exit', code => process.exit(code ?? 1));
