import QRCode from 'qrcode';
import Cursor from './Cursor.js';

export default async function addQRCode(doc, parentCursor, params = {}) {
  const { availableWidth, availableHeight, size: requestedSize } = params;

  const cursor = Cursor(parentCursor);
  const size = Math.min(requestedSize, availableHeight, availableWidth);

  doc.image(
    await QRCode.toDataURL(params.value, { width: size }),
    cursor.x,
    cursor.y,
  );

  return {
    width: size,
    height: size,
  };
}
