function extractQueryPart() {
  const parts = window.location.href.split('?');

  return parts.length > 1 ? parts[1] : null;
}

export default pageProps => {
  const query = extractQueryPart();

  const { iframeParent, root: rootPage } = pageProps;

  const shareURL = `${iframeParent || rootPage}/share${query ? `?${query}` : ''}`;

  return `<iframe data-oa-frame allowtransparency="allowtransparency" frameborder="0" data-target-url="${rootPage}" src="${shareURL}"></iframe><script type="text/javascript" src="${rootPage}/js/oaFrameController.js"></script>`;
};
