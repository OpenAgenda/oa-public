import { useIntl } from 'react-intl';
import {
  Box,
  Container,
  Flex,
  VStack,
  Link,
  Text,
  SimpleGrid,
} from '@openagenda/uikit';
import { color } from 'utils/strapi';
import Image from 'components/Image';
import logoPic from '../../../public/images/oa.svg';
import messages from './messages';

type LinkData = {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
};

type Column = {
  id: string;
  title: string;
  Links: LinkData[];
};

type FooterProps = {
  Columns?: Column[];
  contactUrl: string;
  backgroundColor?: any;
  colorVariant?: string;
};

function calculateColsForBreakpoint(
  itemCount: number,
  maxAllowedCols: number,
  idealColsFromSqrt: number,
): number {
  if (itemCount <= 0) return 1;
  if (itemCount === 1) return 1;

  if (itemCount <= maxAllowedCols) {
    return itemCount;
  }

  let numCols = Math.min(maxAllowedCols, idealColsFromSqrt);
  numCols = Math.max(1, numCols);

  // Refinement: If using maxAllowedCols is "better" (fewer rows, or perfect filling)
  // and our current calculation (numCols) is less than maxAllowedCols, we prefer maxAllowedCols.
  // This serves for cases like 8 items, where idealColsFromSqrt=3, but maxAllowedCols=4 is better (4+4).
  if (numCols < maxAllowedCols) {
    // Only if the calculated ideal is smaller than the breakpoint max
    const rowsWithCurrentNumCols = Math.ceil(itemCount / numCols);
    const rowsWithMaxAllowedCols = Math.ceil(itemCount / maxAllowedCols);

    // Prefer maxAllowedCols if:
    // 1. It results in fewer rows.
    // OR 2. The number of rows is the same AND the filling is perfect with maxAllowedCols.
    if (
      rowsWithMaxAllowedCols < rowsWithCurrentNumCols ||
      (rowsWithMaxAllowedCols === rowsWithCurrentNumCols &&
        itemCount % maxAllowedCols === 0)
    ) {
      numCols = maxAllowedCols;
    }
  }

  return numCols;
}

function getResponsiveGridColumns(itemCount: number) {
  if (itemCount <= 0) return { base: 1 };

  // itemCount = 1: base=1, sm=1, md=1, lg=1
  // itemCount = 2: base=1, sm=2, md=2, lg=2
  // itemCount = 3: base=1, sm=2 (items: 2,1), md=3 (3x1), lg=3 (3x1)
  // itemCount = 4: base=1, sm=2 (2x2), md=2 (2x2), lg=4 (1x4)
  // itemCount = 5: base=1, sm=2 (2,2,1), md=3 (3,2), lg=3 (3,2)
  // itemCount = 6: base=1, sm=2 (2x3), md=3 (3x2), lg=3 (3x2)
  // itemCount = 7: base=1, sm=2 (2,2,2,1), md=3 (3,3,1), lg=4 (4,3)
  // itemCount = 8: base=1, sm=2 (2x4), md=3 (3,3,2), lg=4 (4x2)

  const idealColsFromSqrt = Math.ceil(Math.sqrt(itemCount));

  return {
    base: 1,
    sm: calculateColsForBreakpoint(itemCount, 2, idealColsFromSqrt),
    md: calculateColsForBreakpoint(itemCount, 3, idealColsFromSqrt),
    lg: calculateColsForBreakpoint(itemCount, 4, idealColsFromSqrt),
  };
}

function ColumnItem({
  title,
  Links,
  backgroundColor,
}: Column & { backgroundColor?: any }) {
  return (
    <VStack align="start" gap={3}>
      <Text fontWeight="bold" fontSize="lg">
        {title}
      </Text>
      <VStack align="start" gap={2}>
        {Links.map((link) => (
          <Link
            key={link.id}
            href={link.url}
            target={link.isExternal ? '_blank' : undefined}
            rel={link.isExternal ? 'noopener nofollow' : undefined}
            color={backgroundColor ? 'gray.300' : 'gray.600'}
            _hover={{ color: 'primary.500' }}
          >
            {link.label}
          </Link>
        ))}
      </VStack>
    </VStack>
  );
}

export default function Footer({
  Columns: FooterColumnsData,
  contactUrl,
  backgroundColor,
  colorVariant = 'solid',
}: FooterProps) {
  const intl = useIntl();

  const dataColumns = FooterColumnsData || [];
  const totalItemsInGrid = 1 + dataColumns.length; // +1 for the contact column

  const gridColumnConfig = getResponsiveGridColumns(totalItemsInGrid);

  const contactColumnJsx = (
    <VStack align="start" gap={3}>
      <Text fontWeight="bold" fontSize="lg">
        {intl.formatMessage(messages.contact)}
      </Text>
      <VStack align="start" gap={2}>
        <Link
          href={contactUrl}
          color={backgroundColor ? 'gray.300' : 'gray.600'}
          _hover={{ color: 'primary.500' }}
        >
          {intl.formatMessage(messages.contactForm)}
        </Link>
        <Link
          href="https://www.linkedin.com/company/openagenda"
          target="_blank"
          rel="noopener nofollow"
          color={backgroundColor ? 'gray.300' : 'gray.600'}
          _hover={{ color: 'primary.500' }}
        >
          {intl.formatMessage(messages.linkedin)}
        </Link>
        <Link
          href="https://github.com/openagenda"
          target="_blank"
          rel="noopener nofollow"
          color={backgroundColor ? 'gray.300' : 'gray.600'}
          _hover={{ color: 'primary.500' }}
        >
          {intl.formatMessage(messages.github)}
        </Link>
      </VStack>
    </VStack>
  );

  return (
    <Box
      backgroundColor={
        backgroundColor
          ? [color(`${backgroundColor?.name}`), colorVariant].join('.')
          : null
      }
    >
      <Container maxW="7xl" pt="18" pb="12">
        <Box
          borderTop="solid 2px"
          borderColor={color('strapi.flashy.blueViolet', 600)}
          pb="12"
        />
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 8, md: 10 }}
          alignItems={{ base: 'start', md: 'start' }}
        >
          <Box flexShrink={0} mb={{ base: 6, md: 0 }}>
            <Image src={logoPic} width="172" alt="" />
          </Box>

          {totalItemsInGrid > 0 && (
            <SimpleGrid
              columns={gridColumnConfig}
              gapX={{ base: 6, md: 8 }}
              gapY={{ base: 8, md: 10 }}
              width="100%"
            >
              {contactColumnJsx}
              {dataColumns.map((columnData) => (
                <ColumnItem
                  key={columnData.id}
                  {...columnData}
                  backgroundColor={backgroundColor}
                />
              ))}
            </SimpleGrid>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
