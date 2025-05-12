import { Button, useDisclosure } from '../src';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Dialog',
  decorators: [Provider],
};

export function All() {
  const { open, onOpen, onClose } = useDisclosure({ defaultOpen: true });

  return (
    <>
      <Button colorPalette="primary" onClick={onOpen}>
        Open Modal
      </Button>

      <DialogRoot open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader fontSize="xl" fontWeight="semibold">
            Modal Title
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
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
          </DialogBody>

          <DialogFooter>
            <Button colorPalette="primary" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

All.storyName = 'Dialog';
