import PDFExports from '@openagenda/pdf-exports';

export function init(config) {
  return PDFExports({
    logger: config.getLogConfig('svc', 'pdfExports'),
  });
}
