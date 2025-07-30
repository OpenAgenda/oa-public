import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { FaIcon } from 'icons';

import {
  faCalendar as faCalendarSolid,
  faChartNetwork as faChartNetworkSolid,
  faClipboard as faClipboardSolid,
  faCode as faCodeSolid,
  faDownload as faDownloadSolid,
  faMagnifyingGlass as faMagnifyingGlassSolid,
  faPerson as faPersonSolid,
  faRocketLaunch as faRocketLaunchSolid,
  faShare as faShareSolid,
  faShareNodes as faShareNodesSolid,
  faUpRightFromSquare as faUpRightFromSquareSolid,
} from 'icons/solid';

import {
  faCalendar as faCalendarRegular,
  faChartNetwork as faChartNetworkRegular,
  faClipboard as faClipboardRegular,
  faCode as faCodeRegular,
  faDownload as faDownloadRegular,
  faMagnifyingGlass as faMagnifyingGlassRegular,
  faPerson as faPersonRegular,
  faRocketLaunch as faRocketLaunchRegular,
  faShare as faShareRegular,
  faShareNodes as faShareNodesRegular,
  faUpRightFromSquare as faUpRightFromSquareRegular,
} from 'icons/regular';

import {
  faCalendar as faCalendarThin,
  faChartNetwork as faChartNetworkThin,
  faClipboard as faClipboardThin,
  faCode as faCodeThin,
  faDownload as faDownloadThin,
  faMagnifyingGlass as faMagnifyingGlassThin,
  faPerson as faPersonThin,
  faRocketLaunch as faRocketLaunchThin,
  faShare as faShareThin,
  faShareNodes as faShareNodesThin,
  faUpRightFromSquare as faUpRightFromSquareThin,
} from 'icons/thin';

const solid = {
  calendar: faCalendarSolid,
  'chart-network': faChartNetworkSolid,
  clipboard: faClipboardSolid,
  code: faCodeSolid,
  download: faDownloadSolid,
  'magnifying-glass': faMagnifyingGlassSolid,
  person: faPersonSolid,
  'rocket-launch': faRocketLaunchSolid,
  share: faShareSolid,
  'share-nodes': faShareNodesSolid,
  'up-right-from-square': faUpRightFromSquareSolid,
};

const regular = {
  calendar: faCalendarRegular,
  'chart-network': faChartNetworkRegular,
  clipboard: faClipboardRegular,
  code: faCodeRegular,
  download: faDownloadRegular,
  'magnifying-glass': faMagnifyingGlassRegular,
  person: faPersonRegular,
  'rocket-launch': faRocketLaunchRegular,
  share: faShareRegular,
  'share-nodes': faShareNodesRegular,
  'up-right-from-square': faUpRightFromSquareRegular,
};

const thin = {
  calendar: faCalendarThin,
  'chart-network': faChartNetworkThin,
  clipboard: faClipboardThin,
  code: faCodeThin,
  download: faDownloadThin,
  'magnifying-glass': faMagnifyingGlassThin,
  person: faPersonThin,
  'rocket-launch': faRocketLaunchThin,
  share: faShareThin,
  'share-nodes': faShareNodesThin,
  'up-right-from-square': faUpRightFromSquareThin,
};

interface IconProps {
  name: string;
  size?: string;
  style?: 'solid' | 'regular' | 'thin';
  color?: string;
}

export default function Icon({
  name,
  size = 'fa-1x',
  style = 'solid',
  color,
}: IconProps) {
  const iconSet =
    {
      solid,
      regular,
      thin,
    }[style] || regular;

  // Remove 'fa-' prefix from size before passing to FaIcon
  const normalizedSize = size.replace('fa-', '') as SizeProp;

  return <FaIcon icon={iconSet[name]} size={normalizedSize} color={color} />;
}
