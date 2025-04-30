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
      ['outline', 'solid', 'link', 'ghost']
    >;
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

export interface SegmentsAccordionSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_accordion_sets';
  info: {
    description: '';
    displayName: 'AccordionSet';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    borderRadius: Schema.Attribute.Enumeration<
      ['none', 'sm', 'md', 'lg', 'xl', 'full']
    >;
    boxAlign: Schema.Attribute.Enumeration<['left', 'right', 'center']>;
    Components: Schema.Attribute.Component<'components.accordion', true>;
    contentColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    maxWidth: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
    title: Schema.Attribute.String;
    useAccordion: Schema.Attribute.Boolean;
    width: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
  };
}

export interface SegmentsCarouselSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_carousel_sets';
  info: {
    description: '';
    displayName: 'CarouselSet';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    borderRadius: Schema.Attribute.Enumeration<
      ['none', 'sm', 'md', 'lg', 'xl', 'full']
    >;
    carouselBgColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    colorPalette: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    Components: Schema.Attribute.Component<'components.modular', true>;
    description: Schema.Attribute.Text;
    descriptionColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    gradient: Schema.Attribute.Boolean;
    title: Schema.Attribute.String;
    titleColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    variant: Schema.Attribute.Enumeration<
      ['outline', 'solid', 'link', 'ghost']
    >;
    width: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
  };
}

export interface SegmentsModularSet extends Struct.ComponentSchema {
  collectionName: 'components_segments_modular_sets';
  info: {
    description: '';
    displayName: 'ModularSet';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    Components: Schema.Attribute.Component<'components.modular', true>;
    CTA: Schema.Attribute.Component<'components.cta-button', false>;
    description: Schema.Attribute.String;
    descriptionColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    fontColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    fontSize: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
    justifyContent: Schema.Attribute.Enumeration<['left', 'center', 'right']>;
    margin: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
    title: Schema.Attribute.String;
    titleColor: Schema.Attribute.Relation<
      'oneToOne',
      'api::theme-color.theme-color'
    >;
    verticalAlign: Schema.Attribute.Enumeration<
      ['center', 'stretch', 'flex-start']
    >;
    width: Schema.Attribute.Relation<'oneToOne', 'api::size.size'>;
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
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.accordion': ComponentsAccordion;
      'components.cta-button': ComponentsCtaButton;
      'components.icon': ComponentsIcon;
      'components.illustration': ComponentsIllustration;
      'components.modular': ComponentsModular;
      'segments.accordion-set': SegmentsAccordionSet;
      'segments.carousel-set': SegmentsCarouselSet;
      'segments.modular-set': SegmentsModularSet;
      'segments.page-head': SegmentsPageHead;
    }
  }
}
