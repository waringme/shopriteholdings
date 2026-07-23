/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero
 * Base block: hero
 * Source URL: https://www.shopriteholdings.co.za/newsroom/2026/essence-hair-care.html
 * Source selector: .banner-v2
 * Generated for xwalk project (field hints included).
 *
 * UE model (hero): image (reference), imageAlt (collapsed -> img alt), text (richtext -> heading).
 * Structure: 1 column. Row 1 = background image, Row 2 = title heading.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against source.html for .banner-v2)
  // Background image lives in .cmp-image > img
  const image = element.querySelector('.cmp-image img, img.cmp-image__image, img');

  // Title heading: source wraps a <p> inside <span> inside <h1> in .banner-page-title
  const headingEl = element.querySelector('.banner-page-title h1, h1, h2');

  // Bail gracefully if there is no meaningful hero content
  if (!image && !headingEl) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: Background image (field:image). imageAlt is collapsed into the img alt attribute.
  if (image) {
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(image);
    cells.push([imageFrag]);
  }

  // Row: Title (field:text). Normalise nested <p>/<span> inside the heading to a clean heading.
  if (headingEl) {
    const titleText = headingEl.textContent.trim();
    const heading = document.createElement('h1');
    heading.textContent = titleText;

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    textFrag.appendChild(heading);
    cells.push([textFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
