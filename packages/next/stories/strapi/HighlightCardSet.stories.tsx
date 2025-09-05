import HighlightCardSet from 'components/strapi/HighlightCardSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import FullScreenDecorator from '../decorators/FullScreenDecorator';
import highlightCardSetData from './fixtures/highlightCardSet.json';
import highlightCardSetData2 from './fixtures/highlightCardSet.2.json';
import highlightCardSetData3 from './fixtures/highlightCardSet.3.json';
import highlightCardSetData4 from './fixtures/highlightCardSet.4.json';

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

export function horizontalAlignment() {
  return (
    <HighlightCardSet
      title="Les items apparaissent alignés malgré la différence de format des images"
      Cards={highlightCardSetData3.Cards}
    />
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

export function WithLongLinks() {
  return (
    <HighlightCardSet
      title={highlightCardSetData.title}
      description="Découvrez nos principales fonctionnalités et avantages"
      Cards={[highlightCardSetData.Cards[0]]}
    />
  );
}

export function WithMoreActualData() {
  return (
    <HighlightCardSet
      title={highlightCardSetData4.title}
      cardSize={highlightCardSetData4.cardSize}
      Cards={highlightCardSetData4.Cards}
    />
  );
}

export function WithBackground() {
  return (
    <HighlightCardSet
      title={highlightCardSetData.title}
      description="Découvrez nos principales fonctionnalités et avantages"
      Cards={highlightCardSetData.Cards}
      background={{ name: 'charcoal' }}
      fontColor={{ name: 'white' }}
    />
  );
}

export function WithGradientBackground() {
  return (
    <HighlightCardSet
      title={highlightCardSetData.title}
      description="Découvrez nos principales fonctionnalités et avantages"
      Cards={highlightCardSetData.Cards}
      background={{
        name: 'myFirstGradient',
        css: 'linear-gradient(to right bottom, frenchBlue, 80%, moonStone)',
      }}
      fontColor={{ name: 'white' }}
    />
  );
}
