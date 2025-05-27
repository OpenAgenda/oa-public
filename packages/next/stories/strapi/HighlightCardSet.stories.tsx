import { Box } from '@openagenda/uikit';
import HighlightCardComponent from 'components/strapi/HighlightCard';
import HighlightCardSet from 'components/strapi/HighlightCardSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import highlightCardSetData from './fixtures/highlightCardSet.json';

const FullScreenDecorator = (Story) => (
  <Box bg="white">
    <Story />
  </Box>
);

export default {
  title: 'strapi/HighlightCardSet',
  decorators: [FullScreenDecorator, ProvidersDecorator],
};

export function HighlightCard() {
  // Use the third card from the JSON data
  const cardData = highlightCardSetData.Cards[2];

  return (
    <HighlightCardComponent
      title={cardData.title}
      Illustration={cardData.Illustration}
      smallIllustration={cardData.smallIllustration}
      description={cardData.description}
    />
  );
}

export function Overview() {
  return (
    <HighlightCardSet
      title={highlightCardSetData.title}
      Cards={highlightCardSetData.Cards}
    />
  );
}

export function MobileWidth() {
  return (
    <div
      style={{ maxWidth: '375px', border: '2px dashed #ccc', padding: '16px' }}
    >
      <p
        style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        📱 Mobile viewport simulation (375px width) - Cards stack vertically
      </p>
      <HighlightCardSet
        title={highlightCardSetData.title}
        Cards={highlightCardSetData.Cards}
      />
    </div>
  );
}

export function TabletWidth() {
  return (
    <div
      style={{ maxWidth: '768px', border: '2px dashed #ccc', padding: '16px' }}
    >
      <p
        style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        📱 Tablet viewport simulation (768px width)
      </p>
      <HighlightCardSet
        title={highlightCardSetData.title}
        Cards={highlightCardSetData.Cards}
      />
    </div>
  );
}

export function WithActualData() {
  return (
    <HighlightCardSet
      title={highlightCardSetData.title}
      Cards={highlightCardSetData.Cards}
    />
  );
}
