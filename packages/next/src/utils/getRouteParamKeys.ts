export default function getRouteParamKeys(route: string): string[] {
  const segments = route.split('/');

  return segments.reduce((accu, segment) => {
    const isParam = segment.startsWith('[') && segment.endsWith(']');
    if (!isParam) return accu;

    const param = segment.slice(1, -1);
    accu.push(param.startsWith('...') ? param.slice(3) : param);
    return accu;
  }, []);
}
