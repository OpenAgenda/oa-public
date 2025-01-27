import iframeResize from '@iframe-resizer/parent';

function encodeForURLHash(url) {
  const charsToEncode = ['#', '%'];

  let encodedURL = '';
  for (const char of url) {
    if (charsToEncode.includes(char)) {
      encodedURL += `%${char.charCodeAt(0).toString(16).toUpperCase()}`;
    } else {
      encodedURL += char;
    }
  }

  return encodedURL;
}

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

    this.loadEmbeds(element);
  }

  cleanupEmbeds() {
    this.loadedEmbeds.forEach((iframe) => {
      if (!document.body.contains(iframe)) {
        this.loadedEmbeds.delete(iframe);
      }
    });
  }

  loadEmbeds(element) {
    const agendaBlockquotes = element.querySelectorAll('blockquote.oa-agenda');

    agendaBlockquotes.forEach((agendaBlockquote) => {
      const link = agendaBlockquote.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        const embedUrl = this.constructEmbedUrl(href, agendaBlockquote.dataset);
        const iframe = this.createIframe(embedUrl, href);
        this.loadedEmbeds.add(iframe);

        const { iframeHeight } = agendaBlockquote.dataset;

        if (iframeHeight) {
          iframe.scrolling = 'yes';
          iframe.style.height = iframeHeight;
        }

        iframe.addEventListener('load', () => {
          iframeResize(
            {
              license: '12ajjdewwwy-26rnhw2943-1s7g1u8ma0i',
              checkOrigin: false,
              onMessage: this.onChildMessage,
              scrolling: !!iframeHeight,
              direction: iframeHeight ? 'none' : 'vertical',
            },
            iframe,
          );
        });

        agendaBlockquote.parentNode.replaceChild(iframe, agendaBlockquote);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  constructEmbedUrl(href, dataset) {
    const url = new URL(href);
    const segments = url.pathname.split('/');
    const agendaIndex = segments.indexOf('agendas');

    if (agendaIndex !== -1) {
      segments.splice(agendaIndex, 0, 'embed');
    }

    url.pathname = segments.join('/');

    if (dataset.baseUrl) {
      url.searchParams.set('baseUrl', dataset.baseUrl);
    }

    if (dataset.baseUrlTarget) {
      url.searchParams.set('baseUrlTarget', dataset.baseUrlTarget);
    }

    if (dataset.filters) {
      url.searchParams.set('filters', dataset.filters);
    }

    if (dataset.primaryColor) {
      url.searchParams.set('primaryColor', dataset.primaryColor);
    }

    if (dataset.imageList) {
      url.searchParams.set('imageList', dataset.imageList);
    }

    if (dataset.sort) {
      url.searchParams.set('sort', dataset.sort);
    }

    if (dataset.displayTotal) {
      url.searchParams.set('displayTotal', dataset.displayTotal);
    }

    const { hash } = window.location;
    if (hash?.startsWith('#!')) {
      const decodedSrc = decodeURIComponent(hash.substring(2));
      const urlWithInitPath = new URL(decodedSrc, url);
      urlWithInitPath.searchParams.set('initPath', url.pathname + url.search);
      return urlWithInitPath.toString();
    }

    return url.toString();
  }

  createIframe(embedUrl, href) {
    const iframe = document.createElement('iframe');
    iframe.id = `oa-embed-${this.embedCounter}`;
    this.embedCounter += 1;
    // iframe.scrolling = 'no';
    iframe.frameBorder = '0';
    iframe.allowTransparency = 'true';
    iframe.title = 'OpenAgenda Embed';
    iframe.src = embedUrl;
    iframe.loading = 'lazy';

    const uid = href.split('/').pop().split('?')[0];
    iframe.setAttribute('data-agenda-uid', uid);

    iframe.style.width = '100%';
    iframe.style.height = '500px';

    return iframe;
  }

  // eslint-disable-next-line class-methods-use-this
  onChildMessage({ message }) {
    if (message.type === 'urlChange') {
      const newUrl = message.url;

      if (!newUrl) {
        // remove hash
        window.history.replaceState(
          null,
          null,
          window.location.pathname + window.location.search,
        );
        return;
      }

      const encodedNewUrl = `#!${encodeForURLHash(newUrl)}`;
      window.history.replaceState(null, null, encodedNewUrl);
    }
  }
}
