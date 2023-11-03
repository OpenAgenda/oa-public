export default function getQuerySeparator(url) {
  try {
    const urlObj = new URL(url, 'http://n');
    return urlObj.search ? '&' : '?';
  } catch (error) {
    console.error('Invalid URL:', error);
    return '?';
  }
}
