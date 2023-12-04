import { Center, ModalBody, Spinner } from '@openagenda/uikit';

export default function ModalLoadingBody() {
  return (
    <ModalBody pb="4">
      <Center h="100px">
        <Spinner size="xl" />
      </Center>
    </ModalBody>
  );
}
