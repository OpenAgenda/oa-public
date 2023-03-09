import omit from 'lodash/omit';
import getRouteParamKeys from './getRouteParamKeys';

type Params = Record<string, string | string[]>;

export default function getSearchParams(route: string, params: Params): Params {
  return omit(params, getRouteParamKeys(route));
}
