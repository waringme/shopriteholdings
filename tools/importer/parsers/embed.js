/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed
 * Base block: embed
 * Source URL: https://www.shopriteholdings.co.za/newsroom/2026/essence-hair-care.html
 * Source selector: .embed .cmp-embed, .cmp-embed
 * Generated for xwalk project.
 *
 * The embed base block has no UE model with fields — the standard EDS embed block is
 * content-only: a single 1-column row containing a link to the external media URL
 * (no field hints required for content-only cells).
 *
 * Note: the source page contains two .cmp-embed instances:
 *  - a BeyondWords audio player (#embed-df170e6441) — removed by the cleanup transformer;
 *    it has no <iframe>, so this parser bails on it.
 *  - the authorable YouTube video (#embed-f4d78f6c78) — an <iframe> we convert to a link.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against source.html for .cmp-embed)
  const iframe = element.querySelector('iframe[src]');

  // Fall back to an explicit media anchor if one is present.
  const mediaLink = element.querySelector(
    'a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]'
  );

  let url = '';
  if (iframe) {
    url = iframe.getAttribute('src') || '';
  } else if (mediaLink) {
    url = mediaLink.getAttribute('href') || '';
  }

  // Bail gracefully for embeds without an embeddable media URL (e.g. audio player widgets).
  if (!url) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Normalise a YouTube embed URL (…/embed/VIDEO_ID?…) to a canonical watch URL.
  const ytEmbedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/i);
  if (ytEmbedMatch) {
    url = `https://www.youtube.com/watch?v=${ytEmbedMatch[1]}`;
  }

  const link = document.createElement('a');
  link.href = url;
  link.textContent = url;

  const cells = [[link]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed', cells });
  element.replaceWith(block);
}
