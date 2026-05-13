import fs from 'node:fs';

export default function getMessages(localesPath) {
  try {
    return JSON.parse(fs.readFileSync(localesPath, 'utf8'));
  } catch (e) {
    return {};
  }
}
