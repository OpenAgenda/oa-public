import iframeResize from '@iframe-resizer/parent';

export default class EmbedLoader {
  constructor() {
    this.loadedEmbeds = new Set();
    this.embedCounter = 0;
  }

  load(element = document.body) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('OA - Cannot load embed: argument is not an HTMLElement');
    }

    if (element === document.body) {
      this.cleanupEmbeds();
    }

    return this.loadEmbeds(element);
  }

  cleanupEmbeds() {
    this.loadedEmbeds.forEach(iframe => {
      if (!document.body.contains(iframe)) {
        this.loadedEmbeds.delete(iframe);
      }
    });
  }

  loadEmbeds(element) {
    const agendaBlockquotes = element.querySelectorAll('blockquote.oa-agenda');

    agendaBlockquotes.forEach(agendaBlockquote => {
      const link = agendaBlockquote.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        const embedUrl = this.constructEmbedUrl(href);
        const iframe = this.createIframe(embedUrl, href);
        this.loadedEmbeds.add(iframe);

        iframe.addEventListener('load', () => {
          iframeResize({
            license: '12ajjdewwwy-26rnhw2943-1s7g1u8ma0i',
            checkOrigin: false,
          }, iframe);
        });

        agendaBlockquote.parentNode.replaceChild(iframe, agendaBlockquote);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  constructEmbedUrl(href) {
    const url = new URL(href);
    const slug = url.pathname.split('/').pop();
    return `${url.origin}/embed/${slug}`;
  }

  createIframe(embedUrl, href) {
    const iframe = document.createElement('iframe');
    iframe.id = `oa-widget-${this.embedCounter}`;
    this.embedCounter += 1;
    iframe.scrolling = 'no';
    iframe.frameBorder = '0';
    iframe.allowTransparency = 'true';
    iframe.title = 'OpenAgenda agenda';
    iframe.src = embedUrl;
    iframe.loading = 'lazy';

    const slug = href.split('/').pop();
    iframe.setAttribute('data-agenda-slug', slug);

    iframe.style.width = '100%';
    iframe.style.height = '500px';

    return iframe;
  }
}
