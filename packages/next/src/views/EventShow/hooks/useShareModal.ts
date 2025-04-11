import { useDisclosure } from '@openagenda/uikit';
import { useState } from 'react';
import useSearchParams from 'hooks/useSearchParams';

export default function useShareModal() {
  const searchParams = useSearchParams() as { sharemodal?: string };

  const {
    open: shareIsOpen,
    onOpen: shareOnOpen,
    onClose: shareOnClose,
  } = useDisclosure({ defaultOpen: searchParams.sharemodal === '1' });

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
