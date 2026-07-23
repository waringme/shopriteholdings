/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: shopriteholdings section breaks + section metadata.
 *
 * Runs in afterTransform only. Reads payload.template.sections and, for the
 * newsroom-article template (3 sections), inserts an <hr> section break
 * before every section except the first, and a "Section Metadata" block for
 * any section that declares a `style`.
 *
 * Section selectors come from tools/importer/page-templates.json (which was
 * derived from the captured DOM at migration-work/cleaned.html):
 *   - section-1 Hero banner   -> .banner-v2        (line 270)
 *   - section-2 Article body  -> [.cmp-container article, .container]
 *   - section-3 Page metadata -> head              (non-visual)
 * All three sections have style: null, so no Section Metadata blocks are
 * expected on this template; the createBlock path only fires when a future
 * template section sets a style.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

// Resolve the first element matching a section selector. Template selectors
// may be a string or an array of fallback selectors (e.g. section-2). We try
// each in order and return the first match within the element being migrated.
function findSectionElement(element, selector) {
  const selectors = Array.isArray(selector) ? selector : [selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const found = element.querySelector(sel);
      if (found) return found;
    } catch (e) {
      // Ignore invalid selectors (e.g. pseudo-selectors not supported here).
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && template.sections;
  if (!sections || sections.length < 2) return;

  const doc = element.ownerDocument;

  // Process in reverse order so inserting <hr> / metadata for a later section
  // does not shift the DOM position of earlier sections we still need to find.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    const sectionEl = findSectionElement(element, section.selector);
    if (!sectionEl) continue;

    // Section Metadata block for any section that declares a style. All
    // current sections have style: null, so this is a no-op today but keeps
    // the transformer correct if a style is added later.
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (sectionEl.parentNode) {
        sectionEl.parentNode.insertBefore(metadataBlock, sectionEl.nextSibling);
      }
    }

    // Section break: an <hr> before every section except the first.
    if (i > 0 && sectionEl.parentNode) {
      const hr = doc.createElement('hr');
      sectionEl.parentNode.insertBefore(hr, sectionEl);
    }
  }
}
