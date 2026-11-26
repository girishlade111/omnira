import { execSync, spawn } from 'node:child_process';
import * as http from 'node:http';

function waitReady(url: string, retries = 40): Promise<void> {
  return new Promise((resolve, reject) => {
    const attempt = (n: number) => {
      http
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on('error', () => {
          if (n <= 0) {
            reject(new Error(`Server timeout waiting for ${url}`));
            return;
          }
          setTimeout(() => attempt(n - 1), 400);
        });
    };
    attempt(retries);
  });
}

async function main() {
  const port = process.env.TEST_PORT || '3050';
  const baseUrl = `http://localhost:${port}`;
  const srv = spawn('cmd.exe', ['/c', `npx next start -p ${port}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  srv.stdout.on('data', (d) => process.stdout.write(`[srv] ${String(d)}`));
  srv.stderr.on('data', (d) => process.stderr.write(`[srv-err] ${String(d)}`));

  let anyFailed = false;
  try {
    await waitReady(`${baseUrl}/`);
    const env = { ...process.env, BASE_URL: baseUrl };
    const scripts = [
      'scripts/testing/check-routes.ts',
      'scripts/testing/check-assets.ts',
      'scripts/testing/check-overflow.ts',
      'scripts/testing/check-interactions.ts',
      'scripts/testing/compare-geometry.ts',
      'scripts/testing/compare-screenshots.ts',
      'scripts/testing/check-a11y-perf.ts',
    ];
    for (const s of scripts) {
      console.log(`\n=== RUNNING ${s} ===`);
      try {
        execSync(`cmd.exe /c "npx tsx ${s}"`, { stdio: 'inherit', env });
      } catch {
        anyFailed = true;
        console.log(`SCRIPT FAILED: ${s}`);
      }
    }
  } finally {
    if (srv.pid) {
      try {
        execSync(`taskkill /pid ${srv.pid} /T /F`, { stdio: 'ignore' });
      } catch {
        // ignore
      }
    }
  }

  if (anyFailed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
