import NextFutureImage from 'next/future/image';

const OriginalNextFutureImage = NextFutureImage.default;

Object.defineProperty(NextFutureImage, 'default', {
  configurable: true,
  value: props => <OriginalNextFutureImage {...props} unoptimized />,
});

export const parameters = { layout: 'fullscreen' };
