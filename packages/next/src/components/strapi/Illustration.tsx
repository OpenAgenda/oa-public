import { Image } from '@openagenda/uikit';

interface IllustrationProps {
  image: {
    url: string;
  };
  maxWidth?: string;
  borderRadius?: string;
}

export default function Illustration({
  image,
  borderRadius = 'lg',
  maxWidth,
}: IllustrationProps) {
  return (
    <Image
      src={image.url}
      alt="une image"
      borderRadius={borderRadius}
      width="100%"
      maxWidth={maxWidth}
      height="auto"
    />
  );
}
