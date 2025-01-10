import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { FaIcon } from 'icons';

import {
  faCalendar as faCalendarSolid,
  faChartNetwork as faChartNetworkSolid,
  faClipboard as faClipboardSolid,
  faCode as faCodeSolid,
  faDownload as faDownloadSolid,
  faPerson as faPersonSolid,
  faRocketLaunch as faRocketLaunchSolid,
  faShare as faShareSolid,
  faShareNodes as faShareNodesSolid,
} from 'icons/solid';

import {
  faCalendar as faCalendarRegular,
  faChartNetwork as faChartNetworkRegular,
  faClipboard as faClipboardRegular,
  faCode as faCodeRegular,
  faDownload as faDownloadRegular,
  faPerson as faPersonRegular,
  faRocketLaunch as faRocketLaunchRegular,
  faShare as faShareRegular,
  faShareNodes as faShareNodesRegular,
} from 'icons/regular';

import {
  faCalendar as faCalendarThin,
  faChartNetwork as faChartNetworkThin,
  faClipboard as faClipboardThin,
  faCode as faCodeThin,
  faDownload as faDownloadThin,
  faPerson as faPersonThin,
  faRocketLaunch as faRocketLaunchThin,
  faShare as faShareThin,
  faShareNodes as faShareNodesThin,
} from 'icons/thin';

const solid = {
  calendar: faCalendarSolid,
  'chart-network': faChartNetworkSolid,
  clipboard: faClipboardSolid,
  code: faCodeSolid,
  download: faDownloadSolid,
  person: faPersonSolid,
  'rocket-launch': faRocketLaunchSolid,
  share: faShareSolid,
  'share-nodes': faShareNodesSolid,
};

const regular = {
  calendar: faCalendarRegular,
  'chart-network': faChartNetworkRegular,
  clipboard: faClipboardRegular,
  code: faCodeRegular,
  download: faDownloadRegular,
  person: faPersonRegular,
  'rocket-launch': faRocketLaunchRegular,
  share: faShareRegular,
  'share-nodes': faShareNodesRegular,
};

const thin = {
  calendar: faCalendarThin,
  'chart-network': faChartNetworkThin,
  clipboard: faClipboardThin,
  code: faCodeThin,
  download: faDownloadThin,
  person: faPersonThin,
  'rocket-launch': faRocketLaunchThin,
  share: faShareThin,
  'share-nodes': faShareNodesThin,
};

interface IconProps {
  name: string;
  size?: SizeProp;
  style?: 'solid' | 'regular' | 'thin';
}

export default function Icon({
  name,
  size = '1x',
  style = 'solid',
}: IconProps) {
  const iconSet =
    {
      solid,
      regular,
      thin,
    }[style] || regular;

  return <FaIcon icon={iconSet[name]} size={size} />;
}
