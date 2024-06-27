import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Flex,
  Radio,
} from '@openagenda/uikit';

const messages = defineMessages({
  default: {
    id: 'next.views.AgendaShow.PdfOptions.default',
    defaultMessage: 'Par défaut',
  },
  city: {
    id: 'next.views.AgendaShow.PdfOptions.city',
    defaultMessage: 'Mettre en avant la ville',
  },
  locationName: {
    id: 'next.views.AgendaShow.PdfOptions.locationName',
    defaultMessage: 'Mettre en avant le lieu',
  },
});

interface PdfOptionsProps {
  options: Record<string, any>;
  setChoice: (options: any) => void;
}

export default function PdfOptions({
  options,
  setChoice,
}: PdfOptionsProps) {
  const intl = useIntl();

  const [selectedFormat, setSelectedFormat] = useState(options.mode || 'default');

  const handleFormat = (value: string) => {
    setSelectedFormat(value);
    if (value === 'default') {
      setChoice({});
    } else if (value === 'city') {
      setChoice({ mode: 'city' });
    } else if (value === 'locationName') {
      setChoice({ mode: 'locationName' });
    }
  };

  return (
    <Flex ml="2" gap="2" direction="column">
      <Radio defaultChecked isChecked={selectedFormat === 'default'} onClick={() => handleFormat('default')}>{intl.formatMessage(messages.default)}</Radio>
      <Radio isChecked={selectedFormat === 'city'} onClick={() => handleFormat('city')}>{intl.formatMessage(messages.city)}</Radio>
      <Radio isChecked={selectedFormat === 'locationName'} onClick={() => handleFormat('locationName')}>{intl.formatMessage(messages.locationName)}</Radio>
    </Flex>
  );
}
