import list from './list/index.js';
import event from './event/index.js';

export default function PDFExports(config) {
  return {
    list: list(config),
    event: event(config),
  };
}
