import { Image } from '@openagenda/uikit';

interface Width {
  name: string;
}

interface IllustrationProps {
  image: {
    url: string;
    alternativeText?: string;
  };
  width?: Width;
  borderRadius?: string;
}

export default function Illustration({
  image,
  borderRadius = 'lg',
  width,
}: IllustrationProps) {
  if (!image?.url) {
    return null;
  }
  return (
    <Image
      src={image.url}
      alt={image.alternativeText}
      borderRadius={borderRadius !== 'undefined' ? borderRadius : undefined}
      maxWidth="full"
      width={width?.name}
      height="auto"
    />
  );
}
