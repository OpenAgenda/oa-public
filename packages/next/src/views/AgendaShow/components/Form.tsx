import { useCallback } from 'react';
import { useForm } from '@openagenda/react-filters';
import { Flex } from '@openagenda/uikit';

function useHandleSubmit() {
  const form = useForm();

  return useCallback(event => {
    if (event) {
      // sometimes not true, e.g. React Native
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      if (typeof event.stopPropagation === 'function') {
        // prevent any outer forms from receiving the event too
        event.stopPropagation();
      }
    }
    return form.submit();
  }, [form]);
}

export default function Form({ children, ...rest }) {
  const handleSubmit = useHandleSubmit();

  return (
    <Flex direction="column" as="form" onSubmit={handleSubmit} {...rest}>
      {children}
    </Flex>
  );
}
