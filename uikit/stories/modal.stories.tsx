import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Modal',
  decorators: [Provider],
};

export function All() {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores
              ducimus, ea eligendi eveniet excepturi fuga magnam magni nam nulla
              quae quidem rem repellendus sequi sint voluptatem! Adipisci animi
              dignissimos nobis?
            </div>
            <div>
              Accusantium, ad deleniti dolorum eaque earum eius, labore omnis
              quo quod reprehenderit repudiandae sunt velit veniam? Consequuntur
              cum debitis eaque eveniet harum molestiae nulla numquam quasi quo,
              suscipit unde, voluptatem.
            </div>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
