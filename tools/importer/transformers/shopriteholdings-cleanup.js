/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: shopriteholdings site-wide cleanup.
 *
 * Removes non-authorable site chrome and tracking artifacts so the import
 * contains only page-level authorable content (hero, article body, quote,
 * YouTube embed, related-articles carousel).
 *
 * Every selector below was verified against migration-work/cleaned.html
 * (scrape of https://www.shopriteholdings.co.za/newsroom/2026/essence-hair-care.html).
 * Source line references are noted in comments; no selector is guessed.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Removed BEFORE block parsing so parsers don't pick these up.

    // Cookie consent banner. Source: <div id="cookie-container"> (line 2),
    // wrapping #cookie-notification with an #accept-cookie-button.
    WebImporter.DOMUtils.remove(element, ['#cookie-container']);

    // "Listen to this article" BeyondWords audio player. It is rendered as a
    // second AEM embed component (#embed-df170e6441 > .beyondwords-player,
    // line 364-365) that is NOT authorable content — the only authorable
    // embed is the YouTube video (#embed-f4d78f6c78, line 447). Remove it
    // before the embed parser runs so the audio widget is not extracted as
    // an embed block.
    WebImporter.DOMUtils.remove(element, ['#embed-df170e6441']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (site shell / experience fragments).
    WebImporter.DOMUtils.remove(element, [
      // Site header experience fragment: contains the navbar, quick-search,
      // and the ShareThis (.sop / .st-custom-button) social widget.
      // Source: <header class="experiencefragment cmp-xf-root--header ...">
      // (line 29); sharethis buttons at lines 248-259 live inside it.
      'header.cmp-xf-root--header',
      // Site footer experience fragment (quicklinks accordion, social logos,
      // legal links). Source: <footer class="experiencefragment
      // cmp-xf-root--footer ..."> (line 741).
      'footer.cmp-xf-root--footer',
      // Breadcrumb navigation (Home / Newsroom). Source:
      // <nav id="breadcrumb-8177b2dc4c" class="cmp-breadcrumb"> (line 303),
      // wrapped in a .breadcrumb grid column (line 302).
      '.cmp-breadcrumb',
      '.breadcrumb',
      // Hotjar safe-context helper iframe. Source: <iframe
      // id="_hjSafeContext_25232492" ... src="about:blank"> (line 1011).
      '#_hjSafeContext_25232492',
      // Leftover clientlib stylesheet links scattered through the body.
      // Source: <link href="/etc.clientlibs/..."> (lines 26, 244).
      'link',
      // Non-authorable media/embed leftovers.
      'noscript',
      'style',
    ]);

    // Twitter / analytics tracking pixel <img> tags appended at end of body
    // (lines 1007-1010: t.co/i/adsct, analytics.twitter.com/i/adsct).
    // Remove by URL host so genuine content images are untouched.
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (
        src.includes('t.co/i/adsct')
        || src.includes('analytics.twitter.com/i/adsct')
        || src.includes('google.co.uk/ads/ga-audiences')
      ) {
        img.remove();
      }
    });

    // Strip AEM authoring/instrumentation attributes left on the DOM.
    element.querySelectorAll('[data-cmp-data-layer], [data-cmp-hook-image], [data-cmp-is]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-hook-image');
      el.removeAttribute('data-cmp-is');
    });
  }
}
