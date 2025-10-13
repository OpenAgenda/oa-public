import React from 'react';
import { Text, Heading, HeadingProps } from '@openagenda/uikit';
import { color } from 'utils/strapi';

interface TextPart {
  id: number;
  text: string;
  color: {
    id: number;
    documentId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  } | null;
}

interface MultiColorTextProps {
  TextParts: TextPart[];
  as?: React.ElementType;
  fontWeight?: number;
  size?: HeadingProps['size'];
  textAlign?: string;
}

export default function MultiColorText({
  TextParts,
  as: asProp,
  ...props
}: MultiColorTextProps) {
  const Wrapper = asProp === 'h1' ? Heading : Text;
  return (
    <Wrapper as={asProp} {...props}>
      {TextParts.map((part) => (
        <Text
          fontSize="inherit"
          key={part.id}
          as="span"
          color={part.color ? color(part.color.name, 500) : undefined}
        >
          {part.text}
        </Text>
      ))}
    </Wrapper>
  );
}
