import { Center, Spinner } from '@openagenda/uikit';
import { DialogBody } from '@openagenda/uikit/snippets';

export default function ModalLoadingBody() {
  return (
    <DialogBody>
      <Center h="100px">
        <Spinner size="xl" />
      </Center>
    </DialogBody>
  );
}
