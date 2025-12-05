import fs from 'node:fs/promises';
import buildEcosystemFile from '../lib/buildEcosystemFile.mjs';

async function test() {
  console.log('Testing buildEcosystemFile...\n');

  // Test data
  const testDir = './test';
  const testArgsTask = ['task:critical', 'task:search'];
  const testArgsWeb = 'web admin';
  const testArgsApi = 'api';
  const testOptions = {
    envVars: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    dir: testDir,
    instances: 1,
    nodeArgs: '--max-old-space-size=4096',
  };

  try {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });

    // Run the function
    const configPathTask = await buildEcosystemFile(testArgsTask, testOptions);
    const configPathWeb = await buildEcosystemFile(testArgsWeb, testOptions);
    const configPathApi = await buildEcosystemFile(testArgsApi, testOptions);
    console.log(`✓ Generated config file: ${configPathTask}`);
    console.log(`✓ Generated config file: ${configPathWeb}`);
    console.log(`✓ Generated config file: ${configPathApi}`);
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error);
  }
}

test();
