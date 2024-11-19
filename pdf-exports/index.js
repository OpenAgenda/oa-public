import agenda from './agenda/index.js';
import event from './event/index.js';

export default function PDFExports(config) {
  return {
    agenda: agenda(config),
    event: event(config),
  };
}
