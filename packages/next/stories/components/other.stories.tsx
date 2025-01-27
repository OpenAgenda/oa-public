import { Accordion, Box } from '@openagenda/uikit';

import CopyIdentifierComponent from 'components/CopyIdentifier';
import PdfAccordionItem from 'views/AgendaShow/components/ExportModal/PdfAccordionItem';

import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'components/Other',
  decorators: [ProvidersDecorator],
};

export const CopyIdentifier = () => {
  return <CopyIdentifierComponent identifier={12345678} />;
};

export const PDFMenuWithMultipleLocationTrueProp = () => {
  return (
    <Box bg="white" width="md" m="4">
      <Accordion as="form" allowToggle defaultIndex={0} mt="4">
        <PdfAccordionItem handleSubmit={() => {}} hasMultipleLocations />
      </Accordion>
    </Box>
  );
};

export const PDFMenuWithMultipleLocationFalseProp = () => {
  return (
    <Box bg="white" width="md" m="4">
      <Accordion as="form" allowToggle defaultIndex={0} mt="4">
        <PdfAccordionItem handleSubmit={() => {}} />
      </Accordion>
    </Box>
  );
};
