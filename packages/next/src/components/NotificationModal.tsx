import { Button, Text } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';

export default function NotificationModal({
  onClose,
  title,
  message,
  action,
  onAction,
}) {
  return (
    <DialogRoot role="alertdialog" open onOpenChange={onClose}>
      <DialogContent>
        {title ? (
          <DialogHeader fontSize="xl" fontWeight="semibold">
            {title}
          </DialogHeader>
        ) : null}
        <DialogCloseTrigger />
        <DialogBody>
          <Text>{message}</Text>
        </DialogBody>
        <DialogFooter justifyContent="center">
          {action ? <Button onClick={onAction}>{action}</Button> : null}
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
