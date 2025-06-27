import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_components_cta_buttons';
  info: {
    description: '';
    displayName: 'CTAButton';
  };
  attributes: {
    colorPalette: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    label: Schema.Attribute.String;
    link: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<
      ['solid', 'outline', 'link', 'plain', 'subtle', 'surface', 'ghost']
    >;
  };
}

export interface ComponentsFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_components_footer_columns';
  info: {
    description: '';
    displayName: 'FooterColumn';
  };
  attributes: {
    Links: Schema.Attribute.Component<'components.link', true> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsHighlightCard extends Struct.ComponentSchema {
  collectionName: 'components_components_highlight_cards';
  info: {
    description: '';
    displayName: 'HighlightCard';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    image: Schema.Attribute.Media<'images'>;
    smallImage: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface ComponentsIcon extends Struct.ComponentSchema {
  collectionName: 'components_components_icons';
  info: {
    description: '';
    displayName: 'Icon';
  };
  attributes: {
    color: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    name: Schema.Attribute.Enumeration<
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
    style: Schema.Attribute.Enumeration<['regular', 'thin', 'solid']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'regular'>;
  };
}

export interface ComponentsLink extends Struct.ComponentSchema {
  collectionName: 'components_components_footer_links';
  info: {
    description: '';
    displayName: 'Link';
  };
  attributes: {
    isExternal: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsReference extends Struct.ComponentSchema {
  collectionName: 'components_components_reference';
  info: {
    description: '';
    displayName: 'Reference';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    link: Schema.Attribute.String;
    tags: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ComponentsSplitHero extends Struct.ComponentSchema {
  collectionName: 'components_components_split_heroes';
  info: {
    description: '';
    displayName: 'SplitHero';
  };
  attributes: {
    CTAs: Schema.Attribute.Component<'components.cta-button', true>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    text: Schema.Attribute.RichText & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface ComponentsTab extends Struct.ComponentSchema {
  collectionName: 'components_components_tabs';
  info: {
    description: '';
    displayName: 'Tab';
  };
  attributes: {
    content: Schema.Attribute.Component<'components.split-hero', false>;
    title: Schema.Attribute.String;
  };
}

export interface SegmentsHighlightCardSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_highlight_card_sets';
  info: {
    description: '';
    displayName: 'HighlightCardSet';
    icon: 'apps';
  };
  attributes: {
    Cards: Schema.Attribute.Component<'components.highlight-card', true>;
    CTAs: Schema.Attribute.Component<'components.cta-button', true>;
    description: Schema.Attribute.String;
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
    CTAs: Schema.Attribute.Component<'components.cta-button', true>;
    description: Schema.Attribute.RichText;
    descriptionColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    fontSize: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    titleColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    video: Schema.Attribute.Enumeration<['presentation']>;
  };
}

export interface SegmentsReferenceSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_reference_sets';
  info: {
    description: '';
    displayName: 'ReferenceSet';
  };
  attributes: {
    CTAs: Schema.Attribute.Component<'components.cta-button', true>;
    description: Schema.Attribute.String;
    hasFilter: Schema.Attribute.Boolean;
    References: Schema.Attribute.Component<'components.reference', true>;
    smallImage: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SegmentsTabSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_tab_set';
  info: {
    description: '';
    displayName: 'TabSet';
  };
  attributes: {
    CTAs: Schema.Attribute.Component<'components.cta-button', true>;
    description: Schema.Attribute.String;
    Tabs: Schema.Attribute.Component<'components.tab', true>;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.cta-button': ComponentsCtaButton;
      'components.footer-column': ComponentsFooterColumn;
      'components.highlight-card': ComponentsHighlightCard;
      'components.icon': ComponentsIcon;
      'components.link': ComponentsLink;
      'components.reference': ComponentsReference;
      'components.split-hero': ComponentsSplitHero;
      'components.tab': ComponentsTab;
      'segments.highlight-card-set': SegmentsHighlightCardSet;
      'segments.page-head': SegmentsPageHead;
      'segments.reference-set': SegmentsReferenceSet;
      'segments.tab-set': SegmentsTabSet;
    }
  }
}
