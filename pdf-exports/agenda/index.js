import GenerateExportStream from './lib/GenerateExportStream.js';

export default function PDFExports(config) {
  return {
    GenerateExportStream: GenerateExportStream.bind(null, config),
  };
}
