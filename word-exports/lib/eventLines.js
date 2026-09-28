import { run } from './xml.js';
import linkOrText from './links.js';
import messages from './messages.js';

// Lines both exports show the same way: the agenda list items and the event
// document.

const accessibilityKeys = ['ii', 'hi', 'vi', 'pi', 'mi'];

// The registration means as runs, joined by middle dots, or null when none:
// an email or a link is clickable, a phone number is text.
export function registrationRuns(writer, event) {
  const items = (event.registration ?? [])
    .filter((item) => item?.value)
    .map((item) => {
      if (item.type === 'email') {
        return linkOrText(writer, `mailto:${item.value}`, item.value);
      }
      if (item.type === 'link') return linkOrText(writer, item.value);
      return run(item.value);
    });

  return items.length ? items.join(run(' · ')) : null;
}

// « Accessibility: hearing impairment, … », or null when none is declared.
export function accessibilityText(event, intl) {
  const keys = accessibilityKeys.filter(
    (key) => event.accessibility?.[key] === true,
  );

  if (!keys.length) return null;

  const list = keys.map((key) => intl.formatMessage(messages[key])).join(', ');

  return intl.formatMessage(messages.accessibility, { list });
}
