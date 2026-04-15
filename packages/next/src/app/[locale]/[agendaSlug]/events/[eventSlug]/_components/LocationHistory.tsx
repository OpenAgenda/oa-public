import { useIntl } from 'react-intl';
import { Button, Center, useDisclosure } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
} from '@openagenda/uikit/snippets';
import { useAgenda } from '../_context/agenda';
import useEvent from '../_hooks/useEvent';
import { locationHistory as messages } from '../messages';
import { Activities, ActivitiesList } from './Activities';

export default function LocationHistory({
  className = '',
  ref = null,
  ...rest
}) {
  const intl = useIntl();
  const agenda = useAgenda();
  const { event } = useEvent();

  const { open, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        unstyled
        ref={ref}
        className={className}
        {...rest}
        onClick={onOpen}
      >
        {intl.formatMessage(messages.showHistory)}
      </Button>

      <DialogRoot open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader fontSize="xl" fontWeight="semibold">
            {intl.formatMessage(messages.locationHistory)}
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            <Activities
              res={`/api/agendas/${agenda.uid}/locations/${event.location.uid}/activities`}
            >
              <ActivitiesList
                emptyElem={
                  <Center py="12">
                    {intl.formatMessage(messages.noActivity)}
                  </Center>
                }
              />
            </Activities>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
}
