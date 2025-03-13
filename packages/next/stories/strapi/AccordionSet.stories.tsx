import AccordionSet from 'components/strapi/AccordionSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/AccordionSet',
  component: AccordionSet,
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <>
      <AccordionSet
        useAccordion={true}
        Components={[
          {
            id: 1,
            title: 'Section 1',
            description: 'Content for section 1',
            CTA: {
              label: 'Learn more',
              link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
            },
            Icon: {
              name: 'chart-network',
              size: '2x',
              style: 'thin',
            },
          },
          {
            id: 2,
            title: 'Section 2',
            description: 'Content for section 2',
            CTA: {
              label: 'Learn more',
              link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
            },
            Icon: {
              name: 'calendar',
              size: '2x',
              style: 'thin',
            },
          },
          {
            id: 3,
            title: 'Section 3',
            description: 'Content for section 3',
            CTA: {
              label: 'Learn more',
              link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
            },
            Icon: {
              name: 'code',
              size: '2x',
              style: 'thin',
            },
          },
        ]}
      />
      <AccordionSet
        useAccordion={true}
        backgroundColor={{
          name: 'teal',
          swatch: '200',
        }}
        accordionColor={{
          name: 'teal',
          swatch: '800',
        }}
        variant="solid"
        maxWidth={{ name: 'full' }}
        width={{ name: 'full' }}
        Components={[
          {
            id: 1,
            title: 'Section 1',
            description: 'Content for section 1',
            CTA: {
              label: 'Learn more',
              link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
            },
            Icon: {
              name: 'chart-network',
              size: '2x',
              style: 'thin',
            },
          },
          {
            id: 2,
            title: 'Section 2',
            description: 'Content for section 2',
            CTA: {
              label: 'Learn more',
              link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
            },
            Icon: {
              name: 'calendar',
              size: '2x',
              style: 'thin',
            },
          },
          {
            id: 3,
            title: 'Section 3',
            description: 'Content for section 3',
            CTA: {
              label: 'Learn more',
              link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
            },
            Icon: {
              name: 'code',
              size: '2x',
              style: 'thin',
            },
          },
        ]}
      />
    </>
  );
}
