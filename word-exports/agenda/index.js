import GenerateExportStream from './GenerateExportStream.js';

export default function agenda(config) {
  return {
    GenerateExportStream: GenerateExportStream.bind(null, config),
  };
}
