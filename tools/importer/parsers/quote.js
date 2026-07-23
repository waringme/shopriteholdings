/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote
 * Base block: quote
 * Source URL: https://www.shopriteholdings.co.za/newsroom/2026/essence-hair-care.html
 * Source selector: .cmp-text--quote
 * Generated for xwalk project (field hints included).
 *
 * UE model (quote): quote (richtext), author (text).
 * Structure: 1 column, 2 rows -> Row 1 quote text, Row 2 author/attribution.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against source.html for .cmp-text--quote)
  // Inner content is in .cmp-text with paragraphs: first = quotation, remainder = attribution.
  const paragraphs = Array.from(element.querySelectorAll('.cmp-text > p, :scope > .cmp-text > p, p'));

  if (paragraphs.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const quoteP = paragraphs[0];
  // Attribution paragraph(s): everything after the quote. Usually a single line like
  // "-  Agobokwe Motsepe, Essence Hair Care co-founder". Strip a leading dash if present.
  const authorParas = paragraphs.slice(1);

  const cells = [];

  // Row: quote (field:quote)
  const quoteFrag = document.createDocumentFragment();
  quoteFrag.appendChild(document.createComment(' field:quote '));
  quoteFrag.appendChild(quoteP);
  cells.push([quoteFrag]);

  // Row: author (field:author) — only when attribution content exists.
  if (authorParas.length) {
    const authorText = authorParas
      .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
      .join(' ')
      .replace(/^[-–—]\s*/, '')
      .trim();

    if (authorText) {
      const authorP = document.createElement('p');
      authorP.textContent = authorText;
      const authorFrag = document.createDocumentFragment();
      authorFrag.appendChild(document.createComment(' field:author '));
      authorFrag.appendChild(authorP);
      cells.push([authorFrag]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote', cells });
  element.replaceWith(block);
}
