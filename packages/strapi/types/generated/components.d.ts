import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsFeaturedCard extends Struct.ComponentSchema {
  collectionName: 'components_components_featured_cards';
  info: {
    displayName: 'FeaturedCard';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    text: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SegmentsFeatureCardSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_feature_card_sets';
  info: {
    displayName: 'FeatureCardSet';
  };
  attributes: {
    Features: Schema.Attribute.Component<'components.featured-card', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.featured-card': ComponentsFeaturedCard;
      'segments.feature-card-set': SegmentsFeatureCardSet;
    }
  }
}
