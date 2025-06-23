import mime from 'mime';
export default function extensionsToAccept(extensions) {
  const accept = {};
  extensions.forEach(extension => {
    const mimeType = mime.getType(extension);
    if (mimeType) {
      if (!accept[mimeType]) {
        accept[mimeType] = [];
      }
      accept[mimeType].push(".".concat(extension));
    }
  });
  return accept;
}
//# sourceMappingURL=extensionsToAccept.js.map