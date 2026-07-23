/* eslint-disable */
/* global WebImporter */
/**
 * Parser for metadata
 * Base block: metadata
 * Source URL: https://www.shopriteholdings.co.za/newsroom/2026/essence-hair-care.html
 * Source selector: head
 *
 * This is NOT a Universal Editor content block — it produces the standard EDS
 * "Metadata" key/value table (2 columns). No UE field hints are used for Metadata.
 * It is derived from page metadata rather than a rendered DOM element:
 *   - row "image" -> social share image (og:image)
 *   - row "tags"  -> comma-separated tag/keyword list (meta keywords)
 *
 * The parser reads from the document's <meta> tags (available on the live page head).
 *
 * IMPORTANT: `element` here is the document <head>. We must NOT replaceWith/remove
 * the head — the importer's built-in WebImporter.rules.createMetadata reads it later
 * and html2md relies on it. Instead we append the generated Metadata block to the
 * document body so it is picked up as page content, and leave <head> intact.
 *
 * The built-in createMetadata already emits Title/Description/Image from the head;
 * this parser adds the image and tags rows. The import script disables the built-in
 * createMetadata call to avoid emitting two Metadata blocks.
 */
export default function parse(element, { document }) {
  const getMeta = (selectors) => {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      const val = el && (el.getAttribute('content') || '').trim();
      if (val) return val;
    }
    return '';
  };

  const cells = [];

  // Title -> title row.
  const title = getMeta(['meta[property="og:title"]', 'meta[name="og:title"]']);
  const titleEl = document.querySelector('title');
  const titleText = title || (titleEl && titleEl.textContent.replace(/[\n\t]/gm, '').trim());
  if (titleText) cells.push(['title', titleText]);

  // Description -> description row.
  const description = getMeta([
    'meta[name="description"]',
    'meta[property="og:description"]',
  ]);
  if (description) cells.push(['description', description]);

  // Social share image -> image row (rendered as an <img> so it becomes a picture in EDS).
  const ogImage = getMeta([
    'meta[property="og:image"]',
    'meta[name="og:image"]',
    'meta[property="og:image:url"]',
  ]);
  if (ogImage) {
    const img = document.createElement('img');
    img.src = ogImage;
    const ogImageAlt = getMeta(['meta[property="og:image:alt"]', 'meta[name="og:image:alt"]']);
    if (ogImageAlt) img.alt = ogImageAlt;
    cells.push(['image', img]);
  }

  // Tags -> comma-separated keyword list.
  const keywords = getMeta([
    'meta[name="keywords"]',
    'meta[property="article:tag"]',
  ]);
  if (keywords) {
    const tags = keywords
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .join(', ');
    if (tags) cells.push(['tags', tags]);
  }

  // Nothing to emit — leave the head untouched.
  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'metadata', cells });
  const body = document.body || element.ownerDocument.body;
  body.appendChild(block);
}
