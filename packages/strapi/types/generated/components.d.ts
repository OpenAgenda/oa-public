import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsAccordion extends Struct.ComponentSchema {
  collectionName: 'components_components_accordions';
  info: {
    description: '';
    displayName: 'Accordion';
  };
  attributes: {
    contentAlign: Schema.Attribute.Enumeration<['left', 'right', 'center']>;
    contentColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    CTA: Schema.Attribute.Component<'components.cta-button', false>;
    description: Schema.Attribute.Text;
    Icon: Schema.Attribute.Component<'components.icon', false>;
    title: Schema.Attribute.String;
  };
}

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
    Illustration: Schema.Attribute.Component<'components.illustration', false>;
    smallIllustration: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
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

export interface ComponentsIllustration extends Struct.ComponentSchema {
  collectionName: 'components_components_illustrations';
  info: {
    description: '';
    displayName: 'Illustration';
  };
  attributes: {
    borderRadius: Schema.Attribute.Enumeration<
      ['none', 'sm', 'md', 'lg', 'xl', 'full']
    >;
    image: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    width: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
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
    borderRadius: Schema.Attribute.Enumeration<
      ['none', 'sm', 'md', 'lg', 'xl', 'full']
    >;
    card: Schema.Attribute.Boolean;
    contentAlign: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'center'>;
    CTA: Schema.Attribute.Component<'components.cta-button', false>;
    description: Schema.Attribute.Text;
    descriptionColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    fontColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    fontSize: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
    grow: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    Icon: Schema.Attribute.Component<'components.icon', false>;
    Illustration: Schema.Attribute.Component<'components.illustration', false>;
    Tag: Schema.Attribute.String;
    tagColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    title: Schema.Attribute.String;
    titleColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    useCarousel: Schema.Attribute.Boolean;
    verticalAlign: Schema.Attribute.Enumeration<
      ['center', 'stretch', 'flex-start']
    >;
    width: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
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
    Illustration: Schema.Attribute.Component<'components.illustration', false>;
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
    smallIllustrations: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
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
      'components.accordion': ComponentsAccordion;
      'components.cta-button': ComponentsCtaButton;
      'components.footer-column': ComponentsFooterColumn;
      'components.highlight-card': ComponentsHighlightCard;
      'components.icon': ComponentsIcon;
      'components.illustration': ComponentsIllustration;
      'components.link': ComponentsLink;
      'components.modular': ComponentsModular;
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
