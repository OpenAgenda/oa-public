import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fileTypeFromBuffer } from 'file-type';

const {
  S3_ENDPOINT: endpoint,
  S3_REGION: region,
  S3_ACCESS_KEY_ID: accessKeyId,
  S3_SECRET_ACCESS_KEY: secretAccessKey,
  S3_ASSETS_BUCKET: bucket,
} = process.env;

const concurrentUpload = 64;
const bucketPrefix = '_next/static';

const s3 = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
  // logger: console,
});

const mimeFallbacks = {
  '.css': 'text/css',
  '.css.map': 'application/json',
  '.js': 'application/javascript',
  '.js.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

async function detectMimeType(filePath) {
  const fileContent = await readFile(filePath);
  const detectedType = await fileTypeFromBuffer(fileContent);

  if (detectedType) {
    return detectedType.mime;
  }

  const fileName = path.basename(filePath).toLowerCase();

  for (const [ext, mime] of Object.entries(mimeFallbacks)) {
    if (fileName.endsWith(ext)) {
      return mime;
    }
  }

  return 'application/octet-stream';
}

async function uploadFile(filePath, bucketPath) {
  const fileContent = await readFile(filePath);
  const contentType = await detectMimeType(filePath);

  const params = {
    Bucket: bucket,
    Key: bucketPath,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);
  console.log(`Uploaded: ${bucketPath} (${contentType})`);
}

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? getFiles(res) : res;
    }),
  );
  return files.flat();
}

async function processInBatches(objects, concurrentTasks) {
  let index = 0;
  const tasks = new Set();

  const enqueue = () => {
    if (index < objects.length) {
      const object = objects[index];
      index += 1;
      const task = uploadFile(object.file, object.bucketPath).finally(() => {
        tasks.delete(task);
        enqueue();
      });
      tasks.add(task);
      if (tasks.size < concurrentTasks) {
        enqueue();
      }
    }
  };

  enqueue();
  await Promise.all(tasks);
}

async function deploy() {
  const buildDir = path.resolve(import.meta.dirname, '../.next/static');
  const files = await getFiles(buildDir);

  await processInBatches(
    files.map((file) => ({
      file,
      bucketPath: path.join(bucketPrefix, path.relative(buildDir, file)),
    })),
    concurrentUpload,
  );

  console.log('✅ Deployment completed!');
}

deploy().catch((err) => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);
});
