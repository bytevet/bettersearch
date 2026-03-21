import type { TextSegment } from "@/shared/types";
import { MIN_SEGMENT_LENGTH } from "@/shared/constants";

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "SVG",
  "MATH",
  "HEAD",
]);

const BLOCK_TAGS = new Set([
  "DIV",
  "P",
  "SECTION",
  "ARTICLE",
  "ASIDE",
  "HEADER",
  "FOOTER",
  "NAV",
  "MAIN",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LI",
  "TR",
  "TD",
  "TH",
  "BLOCKQUOTE",
  "PRE",
  "FIGCAPTION",
  "DT",
  "DD",
]);

function isHidden(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.hidden) return true;
  const style = getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden";
}

function getXPath(node: Node): string {
  const parts: string[] = [];
  let current: Node | null = node;
  while (current && current !== document) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as Element;
      let index = 1;
      let sibling = el.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === el.tagName) index++;
        sibling = sibling.previousElementSibling;
      }
      parts.unshift(`/${el.tagName.toLowerCase()}[${index}]`);
    }
    current = current.parentNode;
  }
  return parts.join("");
}

export function extractSegments(root: Element = document.body): TextSegment[] {
  const segments: TextSegment[] = [];
  let segId = 0;

  function walk(node: Node, buffer: string[], blockAncestor: Element): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) buffer.push(text);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;

    if (SKIP_TAGS.has(el.tagName) || isHidden(el)) return;

    if (BLOCK_TAGS.has(el.tagName)) {
      // Flush current buffer for previous block
      flushBuffer(buffer, blockAncestor);
      // Start new block
      const newBuffer: string[] = [];
      for (const child of el.childNodes) {
        walk(child, newBuffer, el);
      }
      flushBuffer(newBuffer, el);
      return;
    }

    for (const child of Array.from(el.childNodes)) {
      walk(child, buffer, blockAncestor);
    }
  }

  function flushBuffer(buffer: string[], element: Element): void {
    const text = buffer.join(" ").trim();
    buffer.length = 0;
    if (text.length < MIN_SEGMENT_LENGTH) return;
    segments.push({
      id: `seg-${segId++}`,
      text,
      xpath: getXPath(element),
      elementRef: new WeakRef(element),
    });
  }

  const topBuffer: string[] = [];
  for (const child of root.childNodes) {
    walk(child, topBuffer, root);
  }
  flushBuffer(topBuffer, root);

  return segments;
}
