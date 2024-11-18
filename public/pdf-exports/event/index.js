import GenerateExport from './lib/GenerateExport.js';

export default function PDFExports(config) {
  return {
    GenerateExport: GenerateExport.bind(config),
  };
}
