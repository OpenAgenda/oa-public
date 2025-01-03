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
      maxWidth={maxWidth}
      height="auto"
    />
  );
}
