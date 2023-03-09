import { Center, ModalBody, Spinner } from '@openagenda/uikit';

export default function LoadingBody() {
  return (
    <ModalBody pb="4">
      <Center h="100px">
        <Spinner size="xl" />
      </Center>
    </ModalBody>
  );
}
