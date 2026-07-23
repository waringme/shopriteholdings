/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import quoteParser from './parsers/quote.js';
import embedParser from './parsers/embed.js';
import carouselParser from './parsers/carousel.js';
import metadataParser from './parsers/metadata.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/shopriteholdings-cleanup.js';
import sectionsTransformer from './transformers/shopriteholdings-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'newsroom-article',
  description: 'Newsroom article page with hero, article body, pull quote, video embed, related-articles carousel, and page metadata',
  urls: [
    'https://www.shopriteholdings.co.za/newsroom/2026/essence-hair-care.html',
  ],
  blocks: [
    {
      name: 'hero',
      instances: ['.banner-v2'],
    },
    {
      name: 'quote',
      instances: ['.cmp-text--quote'],
    },
    {
      name: 'embed',
      instances: ['.embed .cmp-embed', '.cmp-embed'],
    },
    {
      name: 'carousel',
      instances: ['.generic-slider', '.cmp-generic-slider'],
    },
    {
      name: 'metadata',
      instances: ['head'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero banner',
      selector: '.banner-v2',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Article body',
      selector: ['.cmp-container article', '.container'],
      style: null,
      blocks: ['quote', 'embed', 'carousel'],
      defaultContent: ['p', 'h2', 'a'],
    },
    {
      id: 'section-3',
      name: 'Page metadata',
      selector: 'head',
      style: null,
      blocks: ['metadata'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  quote: quoteParser,
  embed: embedParser,
  carousel: carouselParser,
  metadata: metadataParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block, skipping any already-replaced (detached) elements.
    // De-dupe by element so overlapping selectors (e.g. .embed .cmp-embed and .cmp-embed) parse once.
    const seen = new Set();
    pageBlocks.forEach((block) => {
      if (seen.has(block.element)) return;
      seen.add(block.element);
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    // Note: createMetadata is intentionally NOT called — the metadata parser
    // already appends a full Metadata block (title, description, image, tags)
    // to the body. Calling createMetadata here would emit a second, duplicate
    // Metadata block from the head meta tags.
    WebImporter.rules.transformBackgroundImages(main, document);
    // Note: adjustImageUrls is intentionally NOT called. The source is imported
    // from a local capture whose content images use relative ./images/ paths that
    // map to the co-located newsroom/2026/images folder; absolutizing them against
    // the import URL would break those local references.

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
