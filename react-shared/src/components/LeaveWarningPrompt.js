import { useLayoutEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Prompt } from 'react-router-dom';

const messages = defineMessages({
  areYouSure: {
    id: 'ReactShared.LeaveWarningPrompt.areYouSure',
    defaultMessage:
      'Are you sure you want to leave this page? All unsaved data will be lost.',
  },
});

function preventUnload(e) {
  e.preventDefault();
  // not possible to customize message - deprecated by modern browsers
  e.returnValue = '';
}

export default function WarningPrompt(props = {}) {
  const intl = useIntl();

  const {
    enabled,
    warnBeforePageUnload = true,
    warnBeforeRouteTransition = false,
  } = props;

  useLayoutEffect(() => {
    if (!window || !warnBeforePageUnload) return;
    if (enabled) {
      window.addEventListener('beforeunload', preventUnload);
    } else {
      window.removeEventListener('beforeunload', preventUnload);
    }
    return () => {
      if (!enabled) {
        return;
      }
      window.removeEventListener('beforeunload', preventUnload);
    };
  }, [enabled, warnBeforePageUnload]);

  if (!warnBeforeRouteTransition) {
    return null;
  }

  return (
    <Prompt
      when={enabled}
      message={() => intl.formatMessage(messages.areYouSure)}
    />
  );
}
