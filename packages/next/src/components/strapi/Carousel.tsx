import { Card, Box, Flex, IconButton } from '@openagenda/uikit';
import { useState } from 'react';
import { FaIcon } from 'icons';
import { faArrowLeft, faArrowRight } from 'icons/regular';

interface Color {
  name: string;
  swatch?: string;
}

interface CarouselProps {
  children: React.ReactNode[];
  colorScheme?: Color;
  backgroundColor?: string;
  borderRadius?: string;
}

export default function Carousel({
  children,
  colorScheme,
  backgroundColor,
  borderRadius = '2xl',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : children.length - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < children.length - 1 ? prevIndex + 1 : 0,
    );
  };

  return (
    <Card
      position="relative"
      width="100%"
      overflow="hidden"
      bg={backgroundColor}
      borderRadius={borderRadius}
      m={8}
      p={8}
    >
      <Flex
        transition="transform 0.5s ease-in-out"
        transform={`translateX(-${currentIndex * 100}%)`}
        width="100%"
        borderRadius={borderRadius}
      >
        {children.map((child, index) => (
          <Box key={index} flex="0 0 100%" width="100%">
            {child}
          </Box>
        ))}
      </Flex>
      <Box display="flex" justifyContent="center" mt={8}>
        <IconButton
          aria-label="Previous"
          icon={<FaIcon icon={faArrowLeft} size="sm" />}
          onClick={handlePrev}
          borderRadius="50%"
          colorScheme={colorScheme ? colorScheme.name : 'primary'}
          size="lg"
          mr={2}
        />
        <IconButton
          aria-label="Next"
          icon={<FaIcon icon={faArrowRight} size="sm" />}
          onClick={handleNext}
          borderRadius="50%"
          colorScheme={colorScheme ? colorScheme.name : 'primary'}
          size="lg"
        />
      </Box>
    </Card>
  );
}
