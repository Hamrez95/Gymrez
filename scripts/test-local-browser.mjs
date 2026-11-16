import { spawn } from 'node:child_process';
const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test'], { stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_EXECUTABLE_PATH: 'C:/Program Files/Google/Chrome/Application/chrome.exe' } });
child.on('exit', code => process.exit(code ?? 1));
