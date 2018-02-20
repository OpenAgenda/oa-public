export default function removeTrailingSlash( path ) {
  return path.substr( -1 ) === '/' ? path.slice( 0, -1 ) : path;
}
