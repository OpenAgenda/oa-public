import HighlightCardSet from 'components/strapi/HighlightCardSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import FullScreenDecorator from '../decorators/FullScreenDecorator';
import highlightCardSetData from './fixtures/highlightCardSet.json';
import highlightCardSetData2 from './fixtures/highlightCardSet.2.json';

export default {
  title: 'strapi/HighlightCardSet',
  component: HighlightCardSet,
  decorators: [FullScreenDecorator, ProvidersDecorator],
};

export function firstUseCase() {
  return (
    <HighlightCardSet
      title={highlightCardSetData.title}
      description="Découvrez nos principales fonctionnalités et avantages"
      Cards={highlightCardSetData.Cards}
    />
  );
}

export function secondUseCase() {
  return (
    <HighlightCardSet
      title={highlightCardSetData2.title}
      description="Une autre présentation de nos services avec description"
      Cards={highlightCardSetData2.Cards}
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
