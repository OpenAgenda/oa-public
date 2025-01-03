import { Image } from '@openagenda/uikit';

interface IllustrationProps {
  image: {
    url: string;
  };
  borderRadius?: string;
}

export default function Illustration({
  image,
  borderRadius = 'lg',
}: IllustrationProps) {
  return (
    <Image
      src={image.url}
      alt="une image"
      borderRadius={borderRadius}
      width="100%"
      height="auto"
    />
  );
}
