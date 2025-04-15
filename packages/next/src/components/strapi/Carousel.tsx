import { Card, Box, IconButton } from '@openagenda/uikit';
import { useState } from 'react';
import { color } from 'utils/strapi';
import { FaIcon } from 'icons';
import { faArrowLeft, faArrowRight } from 'icons/regular';
import Modular from './Modular';

interface Color {
  name: string;
  swatch?: string;
}

interface CarouselProps {
  Components: Array<any>;
  colorPalette?: Color;
  backgroundColor?: Color;
  borderRadius?: string;
  gradient?: boolean;
  variant?: string;
  width?: { name: string };
}

export default function Carousel({
  Components,
  colorPalette,
  backgroundColor,
  borderRadius,
  gradient,
  variant,
  width,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : Components.length - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < Components.length - 1 ? prevIndex + 1 : 0,
    );
  };

  const gradientBackground =
    gradient && backgroundColor
      ? `radial-gradient(circle at top, #fff 50%, {colors.${backgroundColor.name}.50} 80%, {colors.${backgroundColor.name}.100} 93%, {colors.${backgroundColor.name}.200} 100%)`
      : undefined;

  return (
    <Card.Root
      position="relative"
      width={width?.name}
      overflow="hidden"
      bg={!gradient ? color(backgroundColor) : undefined}
      bgGradient={gradientBackground ? gradientBackground : undefined}
      borderRadius={borderRadius}
      my={8}
      mx="auto"
    >
      <Card.Body
        display="flex"
        flexDirection="row"
        transition="transform 0.5s ease-in-out"
        transform={`translateX(-${currentIndex * 100}%)`}
        width="100%"
        p={0}
      >
        {Components.map((Component, index) => (
          <Box
            key={index}
            flex="0 0 100%"
            width="100%"
            p={8}
            display="flex"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
          >
            <Modular {...Component} useCarousel={true} />
          </Box>
        ))}
      </Card.Body>
      <Card.Footer display="flex" justifyContent="center" m={8}>
        <IconButton
          aria-label="Previous"
          onClick={handlePrev}
          borderRadius="50%"
          colorPalette={colorPalette ? colorPalette.name : 'primary'}
          variant={variant as any}
          size="lg"
          mr={1}
        >
          <FaIcon icon={faArrowLeft} size="sm" />
        </IconButton>
        <IconButton
          aria-label="Next"
          onClick={handleNext}
          borderRadius="50%"
          colorPalette={colorPalette ? colorPalette.name : 'primary'}
          variant={variant as any}
          size="lg"
          ml={1}
        >
          <FaIcon icon={faArrowRight} size="sm" />
        </IconButton>
      </Card.Footer>
    </Card.Root>
  );
}
