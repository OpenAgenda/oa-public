// @ts-nocheck

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { far } from '@fortawesome/pro-regular-svg-icons';
import { fat } from '@fortawesome/pro-thin-svg-icons';

import { FaIcon } from 'icons';

library.add(fas, far, fat);

export default function Icon({ type, name, size = '1x' }) {
  return <FaIcon icon={`fa-${type} fa-${name}`} size={size} />;
}
