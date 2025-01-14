import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_components_cta_buttons';
  info: {
    description: '';
    displayName: 'CTAButton';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    fontColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    label: Schema.Attribute.String;
    link: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsIcon extends Struct.ComponentSchema {
  collectionName: 'components_components_icons';
  info: {
    description: '';
    displayName: 'Icon';
  };
  attributes: {
    code: Schema.Attribute.Enumeration<
      [
        'calendar',
        'chart-network',
        'clipboard',
        'code',
        'download',
        'magnifying-glass',
        'person',
        'rocket-launch',
        'share',
        'share-nodes',
      ]
    > &
      Schema.Attribute.Required;
    size: Schema.Attribute.Enumeration<
      [
        'fa-1x',
        'fa-2x',
        'fa-3x',
        'fa-4x',
        'fa-5x',
        'fa-6x',
        'fa-7x',
        'fa-8x',
        'fa-9x',
        'fa-10x',
        'fa-2xs',
        'fa-xs',
        'fa-sm',
        'fa-lg',
        'fa-xl',
        'fa-2xl',
      ]
    > &
      Schema.Attribute.DefaultTo<'fa-1x'>;
    type: Schema.Attribute.Enumeration<['regular', 'thin', 'solid']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'regular'>;
  };
}

export interface ComponentsIllustration extends Struct.ComponentSchema {
  collectionName: 'components_components_illustrations';
  info: {
    description: '';
    displayName: 'Illustration';
  };
  attributes: {
    borderRadius: Schema.Attribute.Enumeration<['undefined', 'full']>;
    image: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    width: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
  };
}

export interface ComponentsModular extends Struct.ComponentSchema {
  collectionName: 'components_components_modulars';
  info: {
    description: '';
    displayName: 'Modular';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    card: Schema.Attribute.Boolean;
    CTA: Schema.Attribute.Component<'components.cta-button', false>;
    description: Schema.Attribute.Text;
    fontColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    Icon: Schema.Attribute.Component<'components.icon', false>;
    Illustration: Schema.Attribute.Component<'components.illustration', false>;
    maxWidth: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
    title: Schema.Attribute.String;
  };
}

export interface SegmentsModularSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_modular_sets';
  info: {
    description: '';
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
    description: '';
    displayName: 'PageHead';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    CTA: Schema.Attribute.Component<'components.cta-button', false>;
    description: Schema.Attribute.Text;
    fontColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    Illustration: Schema.Attribute.Component<'components.illustration', false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.cta-button': ComponentsCtaButton;
      'components.icon': ComponentsIcon;
      'components.illustration': ComponentsIllustration;
      'components.modular': ComponentsModular;
      'segments.modular-set': SegmentsModularSet;
      'segments.page-head': SegmentsPageHead;
    }
  }
}
