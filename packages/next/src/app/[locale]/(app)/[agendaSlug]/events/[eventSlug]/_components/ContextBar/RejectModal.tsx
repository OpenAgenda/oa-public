import { useIntl } from 'react-intl';
import { useState } from 'react';
import { Textarea, Text, Button } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';
import { rejectModal as messages } from '../../messages';

export default function RejectModal({ isOpen, onClose, changeState }) {
  const intl = useIntl();
  const [motive, setMotive] = useState('');

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.confirmRejection)}
        </DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          <b>{intl.formatMessage(messages.motive)}</b>
          <Text pb={2}>{intl.formatMessage(messages.motiveInfo)}</Text>
          <Textarea
            value={motive}
            onChange={(e) => setMotive(e.target.value)}
            placeholder={intl.formatMessage(messages.motivePlaceholder)}
          />
          <DialogFooter justifyContent="center">
            <Button
              onClick={() => {
                changeState(motive);
                onClose();
              }}
            >
              {intl.formatMessage(messages.confirm)}
            </Button>
          </DialogFooter>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
