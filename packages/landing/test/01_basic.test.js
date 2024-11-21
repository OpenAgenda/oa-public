import fs from 'node:fs';
import segments from '../segment-pages/index.js';

describe('segments renderer basic usage', () => {
  it('The simplest usage', () => {
    const f = segments({
      templates: {
        basic: fs.readFileSync(
          `${import.meta.dirname}/templates/basic.pug`,
          'utf-8',
        ),
        h1: fs.readFileSync(`${import.meta.dirname}/templates/h1.pug`, 'utf-8'),
      },
      segments: [
        {
          key: 'agenda-contribution',
          template: 'basic',
          title: 'Customize contribution rules',
        },
        {
          key: 'custom-event-fields',
          template: 'h1',
          title: 'You can customize your event form',
        },
        {
          key: 'not-used-here',
          template: 'basic',
          title: 'This is not printed',
        },
      ],
      pages: [
        {
          key: 'configuration',
          segments: ['custom-event-fields', 'agenda-contribution'],
        },
      ],
    });

    expect(f('configuration').render()).toBe(
      [
        '<h1>You can customize your event form</h1>',
        '<p>Customize contribution rules</p>',
      ].join(''),
    );
  });

  it('with a layout wrapped around the segments', () => {
    const f = segments({
      templates: {
        basic: fs.readFileSync(
          `${import.meta.dirname}/templates/basic.pug`,
          'utf-8',
        ),
        layout: fs.readFileSync(
          `${import.meta.dirname}/templates/layout.pug`,
          'utf-8',
        ),
      },
      segments: [
        {
          key: 'agenda-contribution',
          template: 'basic',
          title: 'Customize contribution rules',
        },
      ],
      pages: [
        {
          key: 'configuration',
          layout: 'layout',
          title: 'This is the page title',
          segments: ['agenda-contribution'],
        },
      ],
    });

    expect(f('configuration').render()).toBe(
      [
        '<div class="layout">',
        '<h1>This is the page title</h1>',
        '<div>',
        '<p>Customize contribution rules</p>',
        '</div>',
        '</div>',
      ].join(''),
    );
  });

  it('with overloads defined at the page level', () => {
    const f = segments({
      templates: {
        basic: fs.readFileSync(
          `${import.meta.dirname}/templates/basic.pug`,
          'utf-8',
        ),
        h1: fs.readFileSync(`${import.meta.dirname}/templates/h1.pug`, 'utf-8'),
      },
      segments: [
        {
          key: 'agenda-contribution',
          template: 'basic',
          title: 'Customize contribution rules',
        },
        {
          key: 'custom-event-fields',
          template: 'h1',
          title: 'You can customize your event form',
        },
      ],
      pages: [
        {
          key: 'configuration',
          segments: [
            {
              key: 'custom-event-fields',
              title: 'You can tweak the content of segments at page level',
            },
            'custom-event-fields',
          ],
        },
      ],
    });

    expect(f('configuration').render()).toBe(
      [
        '<h1>You can tweak the content of segments at page level</h1>',
        '<h1>You can customize your event form</h1>',
      ].join(''),
    );
  });

  it('with links pointing to other pages', () => {
    const f = segments({
      basePath: '/pages',
      templates: {
        linked: fs.readFileSync(
          `${import.meta.dirname}/templates/linked.pug`,
          'utf-8',
        ),
        layout: fs.readFileSync(
          `${import.meta.dirname}/templates/layout.pug`,
          'utf-8',
        ),
      },
      segments: [
        {
          key: 'f1',
          template: 'linked',
          label: 'Yay',
          link: '#page2',
        },
      ],
      pages: [
        {
          key: 'page1',
          layout: 'layout',
          title: 'This is page 1',
          segments: ['f1'],
        },
        {
          key: 'page2',
          layout: 'layout',
          title: 'This is page 2',
          segments: [''],
        },
      ],
    });

    expect(f('page1').render()).toBe(
      [
        '<div class="layout">',
        '<h1>This is page 1</h1>',
        '<div><a href="/pages/page2">Yay</a></div>',
        '</div>',
      ].join(''),
    );
  });

  it('with links pointing to other sites', () => {
    const f = segments({
      basePath: '/pages',
      templates: {
        linked: fs.readFileSync(
          `${import.meta.dirname}/templates/linked.pug`,
          'utf-8',
        ),
        layout: fs.readFileSync(
          `${import.meta.dirname}/templates/layout.pug`,
          'utf-8',
        ),
      },
      segments: [
        {
          key: 'f1',
          template: 'linked',
          label: 'Janine',
          link: 'https://janinelagardienne.com',
        },
      ],
      pages: [
        {
          key: 'page1',
          layout: 'layout',
          title: 'This is page 1',
          segments: ['f1'],
        },
      ],
    });

    expect(f('page1').render()).toBe(
      [
        '<div class="layout">',
        '<h1>This is page 1</h1>',
        '<div><a href="https://janinelagardienne.com">Janine</a></div>',
        '</div>',
      ].join(''),
    );
  });

  it('with several languages', () => {
    const f = segments({
      templates: {
        basic: fs.readFileSync(
          `${import.meta.dirname}/templates/basic.pug`,
          'utf-8',
        ),
        layout: fs.readFileSync(
          `${import.meta.dirname}/templates/layout.pug`,
          'utf-8',
        ),
      },
      segments: [
        {
          key: 'agenda-contribution',
          template: 'basic',
          title: {
            en: 'Customize contribution rules',
            fr: 'Personnalisez les rêgles de contribution',
          },
        },
      ],
      pages: [
        {
          key: 'configuration',
          layout: 'layout',
          title: {
            en: 'This is the page title',
            fr: 'Ceci est le titre de la page',
          },
          segments: ['agenda-contribution'],
        },
      ],
    });

    expect(f('configuration').render({ lang: 'en' })).toBe(
      [
        '<div class="layout">',
        '<h1>This is the page title</h1>',
        '<div>',
        '<p>Customize contribution rules</p>',
        '</div>',
        '</div>',
      ].join(''),
    );
  });
});
