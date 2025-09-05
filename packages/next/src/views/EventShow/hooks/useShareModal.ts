import { useDisclosure } from '@openagenda/uikit';
import { useState } from 'react';

export default function useShareModal({
  defaultOpen = false,
  onClose = null,
} = {}) {
  const {
    open: shareIsOpen,
    onOpen: shareOnOpen,
    onClose: shareOnClose,
  } = useDisclosure({ defaultOpen, onClose });

  const [emailSent, setEmailSent] = useState(0);
  const {
    open: emailSentIsOpen,
    onOpen: emailSentOnOpen,
    onClose: emailSentOnClose,
  } = useDisclosure();

  const onEmailSent = (count: number) => {
    setEmailSent(count);
    emailSentOnOpen();
  };

  return {
    shareIsOpen,
    shareOnOpen,
    shareOnClose,
    emailSent,
    emailSentIsOpen,
    emailSentOnClose,
    onEmailSent,
  };
}
