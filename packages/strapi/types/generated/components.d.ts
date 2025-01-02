import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_components_cta_buttons';
  info: {
    displayName: 'CTAButton';
  };
  attributes: {
    label: Schema.Attribute.String;
    link: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

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

export interface ComponentsIllustration extends Struct.ComponentSchema {
  collectionName: 'components_components_illustrations';
  info: {
    displayName: 'Illustration';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
  };
}

export interface ComponentsModular extends Struct.ComponentSchema {
  collectionName: 'components_components_modulars';
  info: {
    description: '';
    displayName: 'Modular';
  };
  attributes: {
    CTA: Schema.Attribute.Component<'components.cta-button', false>;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files'>;
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

export interface SegmentsModularSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_modular_sets';
  info: {
    displayName: 'ModularSet';
  };
  attributes: {
    Components: Schema.Attribute.Component<'components.modular', true>;
    CTA: Schema.Attribute.Component<'components.cta-button', false>;
    title: Schema.Attribute.String;
  };
}

export interface SegmentsPageHead extends Struct.ComponentSchema {
  collectionName: 'components_segments_page_heads';
  info: {
    displayName: 'PageHead';
  };
  attributes: {
    CTA: Schema.Attribute.Component<'components.cta-button', false>;
    description: Schema.Attribute.Text;
    Illustration: Schema.Attribute.Component<'components.illustration', false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.cta-button': ComponentsCtaButton;
      'components.featured-card': ComponentsFeaturedCard;
      'components.illustration': ComponentsIllustration;
      'components.modular': ComponentsModular;
      'segments.feature-card-set': SegmentsFeatureCardSet;
      'segments.modular-set': SegmentsModularSet;
      'segments.page-head': SegmentsPageHead;
    }
  }
}
