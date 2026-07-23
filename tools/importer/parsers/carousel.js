/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel
 * Base block: carousel
 * Source URL: https://www.shopriteholdings.co.za/newsroom/2026/essence-hair-care.html
 * Source selector: .generic-slider, .cmp-generic-slider
 * Generated for xwalk project (field hints included).
 *
 * UE model (carousel-item): backgroundImage (reference), backgroundImageAlt (collapsed -> img alt),
 * text (richtext). Container block: first row = block name, then one row per slide.
 * Each slide cell holds the slide image (field:backgroundImage) followed by the rich text
 * (field:text): category/date line, headline link, summary, and read-more link.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against source.html for .generic-slider / .cmp-generic-slider)
  // Slides are .carousel-item (a.k.a. .swiper-slide).
  const slides = Array.from(element.querySelectorAll('.carousel-item, .swiper-slide'));

  if (slides.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  slides.forEach((slide) => {
    const image = slide.querySelector('.post-image img, img');

    // Build the rich-text content for the slide.
    const content = [];

    // Category / date line (e.g. "Brand News | Jul 19, 2026")
    const tags = slide.querySelector('.post-tags');
    if (tags) {
      const tagText = tags.textContent.replace(/\s+/g, ' ').trim();
      if (tagText) {
        const tagP = document.createElement('p');
        tagP.textContent = tagText;
        content.push(tagP);
      }
    }

    // Headline (link) — source uses <h6><a>…</a></h6>; render as a heading with the link.
    const headlineLink = slide.querySelector('h6 a, h3 a, h4 a, .card-body h6, .card-body h3');
    if (headlineLink) {
      const heading = document.createElement('h3');
      if (headlineLink.tagName === 'A') {
        const a = document.createElement('a');
        a.href = headlineLink.getAttribute('href') || '';
        a.textContent = headlineLink.textContent.replace(/\s+/g, ' ').trim();
        heading.appendChild(a);
      } else {
        heading.textContent = headlineLink.textContent.replace(/\s+/g, ' ').trim();
      }
      content.push(heading);
    }

    // Summary paragraph
    const summary = slide.querySelector('.teaser-description');
    if (summary) {
      const sumText = summary.textContent.replace(/\s+/g, ' ').trim();
      if (sumText) {
        const sumP = document.createElement('p');
        sumP.textContent = sumText;
        content.push(sumP);
      }
    }

    // Read-more link
    const readMore = slide.querySelector('a.readmore-post');
    if (readMore) {
      const a = document.createElement('a');
      a.href = readMore.getAttribute('href') || '';
      a.textContent = readMore.textContent.replace(/\s+/g, ' ').trim() || 'READ MORE';
      const p = document.createElement('p');
      p.appendChild(a);
      content.push(p);
    }

    // Emit TWO cells per slide so the carousel block JS splits them into
    // .carousel-slide-image (column 0) and .carousel-slide-content (column 1).
    // Image cell (field:backgroundImage).
    const imageCell = document.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document.createComment(' field:backgroundImage '));
      imageCell.appendChild(image);
    }

    // Content cell (field:text): category/date, headline, summary, read-more.
    const contentCell = document.createDocumentFragment();
    if (content.length) {
      contentCell.appendChild(document.createComment(' field:text '));
      content.forEach((node) => contentCell.appendChild(node));
    }

    // Only emit a slide row when it has content.
    if (image || content.length) {
      cells.push([imageCell, contentCell]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });

  // The source wraps a ".slideTitle" header (an <h2> like "More articles" plus a
  // "VIEW ALL ARTICLES" button) inside the slider container. These are page-level
  // default content that precede the carousel, not part of any slide — hoist them
  // out ahead of the block so they are preserved.
  const preface = document.createDocumentFragment();
  const slideTitle = element.querySelector('.slideTitle');
  if (slideTitle) {
    const heading = slideTitle.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent.trim()) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
      preface.appendChild(h);
    }
    const button = slideTitle.querySelector('a[href]');
    if (button && button.textContent.trim()) {
      const a = document.createElement('a');
      a.href = button.getAttribute('href') || '';
      a.textContent = button.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.appendChild(a);
      preface.appendChild(p);
    }
  }

  if (preface.childNodes.length) {
    element.replaceWith(preface, block);
  } else {
    element.replaceWith(block);
  }
}
