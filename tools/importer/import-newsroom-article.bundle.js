/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-newsroom-article.js
  var import_newsroom_article_exports = {};
  __export(import_newsroom_article_exports, {
    default: () => import_newsroom_article_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const image = element.querySelector(".cmp-image img, img.cmp-image__image, img");
    const headingEl = element.querySelector(".banner-page-title h1, h1, h2");
    if (!image && !headingEl) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imageFrag = document.createDocumentFragment();
      imageFrag.appendChild(document.createComment(" field:image "));
      imageFrag.appendChild(image);
      cells.push([imageFrag]);
    }
    if (headingEl) {
      const titleText = headingEl.textContent.trim();
      const heading = document.createElement("h1");
      heading.textContent = titleText;
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      textFrag.appendChild(heading);
      cells.push([textFrag]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote.js
  function parse2(element, { document }) {
    const paragraphs = Array.from(element.querySelectorAll(".cmp-text > p, :scope > .cmp-text > p, p"));
    if (paragraphs.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const quoteP = paragraphs[0];
    const authorParas = paragraphs.slice(1);
    const cells = [];
    const quoteFrag = document.createDocumentFragment();
    quoteFrag.appendChild(document.createComment(" field:quote "));
    quoteFrag.appendChild(quoteP);
    cells.push([quoteFrag]);
    if (authorParas.length) {
      const authorText = authorParas.map((p) => p.textContent.replace(/\s+/g, " ").trim()).join(" ").replace(/^[-–—]\s*/, "").trim();
      if (authorText) {
        const authorP = document.createElement("p");
        authorP.textContent = authorText;
        const authorFrag = document.createDocumentFragment();
        authorFrag.appendChild(document.createComment(" field:author "));
        authorFrag.appendChild(authorP);
        cells.push([authorFrag]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "quote", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed.js
  function parse3(element, { document }) {
    const iframe = element.querySelector("iframe[src]");
    const mediaLink = element.querySelector(
      'a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]'
    );
    let url = "";
    if (iframe) {
      url = iframe.getAttribute("src") || "";
    } else if (mediaLink) {
      url = mediaLink.getAttribute("href") || "";
    }
    if (!url) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const ytEmbedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/i);
    if (ytEmbedMatch) {
      url = `https://www.youtube.com/watch?v=${ytEmbedMatch[1]}`;
    }
    const link = document.createElement("a");
    link.href = url;
    link.textContent = url;
    const cells = [[link]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse4(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".carousel-item, .swiper-slide"));
    if (slides.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".post-image img, img");
      const content = [];
      const tags = slide.querySelector(".post-tags");
      if (tags) {
        const tagText = tags.textContent.replace(/\s+/g, " ").trim();
        if (tagText) {
          const tagP = document.createElement("p");
          tagP.textContent = tagText;
          content.push(tagP);
        }
      }
      const headlineLink = slide.querySelector("h6 a, h3 a, h4 a, .card-body h6, .card-body h3");
      if (headlineLink) {
        const heading = document.createElement("h3");
        if (headlineLink.tagName === "A") {
          const a = document.createElement("a");
          a.href = headlineLink.getAttribute("href") || "";
          a.textContent = headlineLink.textContent.replace(/\s+/g, " ").trim();
          heading.appendChild(a);
        } else {
          heading.textContent = headlineLink.textContent.replace(/\s+/g, " ").trim();
        }
        content.push(heading);
      }
      const summary = slide.querySelector(".teaser-description");
      if (summary) {
        const sumText = summary.textContent.replace(/\s+/g, " ").trim();
        if (sumText) {
          const sumP = document.createElement("p");
          sumP.textContent = sumText;
          content.push(sumP);
        }
      }
      const readMore = slide.querySelector("a.readmore-post");
      if (readMore) {
        const a = document.createElement("a");
        a.href = readMore.getAttribute("href") || "";
        a.textContent = readMore.textContent.replace(/\s+/g, " ").trim() || "READ MORE";
        const p = document.createElement("p");
        p.appendChild(a);
        content.push(p);
      }
      const imageCell = document.createDocumentFragment();
      if (image) {
        imageCell.appendChild(document.createComment(" field:backgroundImage "));
        imageCell.appendChild(image);
      }
      const contentCell = document.createDocumentFragment();
      if (content.length) {
        contentCell.appendChild(document.createComment(" field:text "));
        content.forEach((node) => contentCell.appendChild(node));
      }
      if (image || content.length) {
        cells.push([imageCell, contentCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel", cells });
    const preface = document.createDocumentFragment();
    const slideTitle = element.querySelector(".slideTitle");
    if (slideTitle) {
      const heading = slideTitle.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading && heading.textContent.trim()) {
        const h = document.createElement(heading.tagName.toLowerCase());
        h.textContent = heading.textContent.replace(/\s+/g, " ").trim();
        preface.appendChild(h);
      }
      const button = slideTitle.querySelector("a[href]");
      if (button && button.textContent.trim()) {
        const a = document.createElement("a");
        a.href = button.getAttribute("href") || "";
        a.textContent = button.textContent.replace(/\s+/g, " ").trim();
        const p = document.createElement("p");
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

  // tools/importer/parsers/metadata.js
  function parse5(element, { document }) {
    const getMeta = (selectors) => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        const val = el && (el.getAttribute("content") || "").trim();
        if (val) return val;
      }
      return "";
    };
    const cells = [];
    const title = getMeta(['meta[property="og:title"]', 'meta[name="og:title"]']);
    const titleEl = document.querySelector("title");
    const titleText = title || titleEl && titleEl.textContent.replace(/[\n\t]/gm, "").trim();
    if (titleText) cells.push(["title", titleText]);
    const description = getMeta([
      'meta[name="description"]',
      'meta[property="og:description"]'
    ]);
    if (description) cells.push(["description", description]);
    const ogImage = getMeta([
      'meta[property="og:image"]',
      'meta[name="og:image"]',
      'meta[property="og:image:url"]'
    ]);
    if (ogImage) {
      const img = document.createElement("img");
      img.src = ogImage;
      const ogImageAlt = getMeta(['meta[property="og:image:alt"]', 'meta[name="og:image:alt"]']);
      if (ogImageAlt) img.alt = ogImageAlt;
      cells.push(["image", img]);
    }
    const keywords = getMeta([
      'meta[name="keywords"]',
      'meta[property="article:tag"]'
    ]);
    if (keywords) {
      const tags = keywords.split(",").map((t) => t.trim()).filter(Boolean).join(", ");
      if (tags) cells.push(["tags", tags]);
    }
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "metadata", cells });
    const body = document.body || element.ownerDocument.body;
    body.appendChild(block);
  }

  // tools/importer/transformers/shopriteholdings-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["#cookie-container"]);
      WebImporter.DOMUtils.remove(element, ["#embed-df170e6441"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Site header experience fragment: contains the navbar, quick-search,
        // and the ShareThis (.sop / .st-custom-button) social widget.
        // Source: <header class="experiencefragment cmp-xf-root--header ...">
        // (line 29); sharethis buttons at lines 248-259 live inside it.
        "header.cmp-xf-root--header",
        // Site footer experience fragment (quicklinks accordion, social logos,
        // legal links). Source: <footer class="experiencefragment
        // cmp-xf-root--footer ..."> (line 741).
        "footer.cmp-xf-root--footer",
        // Breadcrumb navigation (Home / Newsroom). Source:
        // <nav id="breadcrumb-8177b2dc4c" class="cmp-breadcrumb"> (line 303),
        // wrapped in a .breadcrumb grid column (line 302).
        ".cmp-breadcrumb",
        ".breadcrumb",
        // Hotjar safe-context helper iframe. Source: <iframe
        // id="_hjSafeContext_25232492" ... src="about:blank"> (line 1011).
        "#_hjSafeContext_25232492",
        // Leftover clientlib stylesheet links scattered through the body.
        // Source: <link href="/etc.clientlibs/..."> (lines 26, 244).
        "link",
        // Non-authorable media/embed leftovers.
        "noscript",
        "style"
      ]);
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (src.includes("t.co/i/adsct") || src.includes("analytics.twitter.com/i/adsct") || src.includes("google.co.uk/ads/ga-audiences")) {
          img.remove();
        }
      });
      element.querySelectorAll("[data-cmp-data-layer], [data-cmp-hook-image], [data-cmp-is]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-hook-image");
        el.removeAttribute("data-cmp-is");
      });
    }
  }

  // tools/importer/transformers/shopriteholdings-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function findSectionElement(element, selector) {
    const selectors = Array.isArray(selector) ? selector : [selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const found = element.querySelector(sel);
        if (found) return found;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section.selector);
      if (!sectionEl) continue;
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (sectionEl.parentNode) {
          sectionEl.parentNode.insertBefore(metadataBlock, sectionEl.nextSibling);
        }
      }
      if (i > 0 && sectionEl.parentNode) {
        const hr = doc.createElement("hr");
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }

  // tools/importer/import-newsroom-article.js
  var PAGE_TEMPLATE = {
    name: "newsroom-article",
    description: "Newsroom article page with hero, article body, pull quote, video embed, related-articles carousel, and page metadata",
    urls: [
      "https://www.shopriteholdings.co.za/newsroom/2026/essence-hair-care.html"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".banner-v2"]
      },
      {
        name: "quote",
        instances: [".cmp-text--quote"]
      },
      {
        name: "embed",
        instances: [".embed .cmp-embed", ".cmp-embed"]
      },
      {
        name: "carousel",
        instances: [".generic-slider", ".cmp-generic-slider"]
      },
      {
        name: "metadata",
        instances: ["head"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero banner",
        selector: ".banner-v2",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Article body",
        selector: [".cmp-container article", ".container"],
        style: null,
        blocks: ["quote", "embed", "carousel"],
        defaultContent: ["p", "h2", "a"]
      },
      {
        id: "section-3",
        name: "Page metadata",
        selector: "head",
        style: null,
        blocks: ["metadata"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    hero: parse,
    quote: parse2,
    embed: parse3,
    carousel: parse4,
    metadata: parse5
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_newsroom_article_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      const seen = /* @__PURE__ */ new Set();
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.transformBackgroundImages(main, document);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_newsroom_article_exports);
})();
