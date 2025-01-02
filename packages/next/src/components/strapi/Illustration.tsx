import { Image } from '@openagenda/uikit';

interface IllustrationProps {
  image: {
    url: string;
  };
}

export default function Illustration({ image }: IllustrationProps) {
  return (
    <Image
      src={image.url}
      alt="une image"
      borderRadius="lg"
      width="100%"
      height="auto"
    />
  );
}
