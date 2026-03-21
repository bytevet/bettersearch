import { escapeRegex } from "@/lib/utils";

const HIGHLIGHT_CLASS = "bettersearch-highlight";
const ACTIVE_CLASS = "bettersearch-highlight-active";
const STYLE_ID = "bettersearch-styles";

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      background-color: #fef08a;
      border-radius: 2px;
      padding: 0 1px;
    }
    .${ACTIVE_CLASS} {
      background-color: #fb923c;
      animation: bettersearch-pulse 0.6s ease-in-out;
    }
    @keyframes bettersearch-pulse {
      0%, 100% { background-color: #fb923c; }
      50% { background-color: #fdba74; }
    }
  `;
  document.head.appendChild(style);
}

function resolveXPath(xpath: string): Element | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    return result.singleNodeValue as Element | null;
  } catch {
    return null;
  }
}

export function highlightSegment(
  xpath: string,
  terms: string[],
  elementRef?: WeakRef<Node>,
): void {
  injectStyles();
  clearHighlights();

  const element =
    (elementRef?.deref() as Element | undefined) ?? resolveXPath(xpath);
  if (!element) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  const lowerTerms = terms.map((t) => t.toLowerCase());
  let firstMark: HTMLElement | null = null;

  for (const textNode of textNodes) {
    const text = textNode.textContent ?? "";
    const fragments = splitByTerms(text, lowerTerms);
    if (fragments.length <= 1) continue;

    const parent = textNode.parentNode;
    if (!parent) continue;

    const frag = document.createDocumentFragment();
    for (const f of fragments) {
      if (f.match) {
        const mark = document.createElement("mark");
        mark.className = HIGHLIGHT_CLASS;
        mark.textContent = f.text;
        if (!firstMark) firstMark = mark;
        frag.appendChild(mark);
      } else {
        frag.appendChild(document.createTextNode(f.text));
      }
    }
    parent.replaceChild(frag, textNode);
  }

  if (firstMark) {
    firstMark.classList.add(ACTIVE_CLASS);
    firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

interface TextFragment {
  text: string;
  match: boolean;
}

function splitByTerms(text: string, lowerTerms: string[]): TextFragment[] {
  if (!lowerTerms.length) return [{ text, match: false }];

  const escaped = lowerTerms.map(escapeRegex);
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  if (parts.length <= 1) return [{ text, match: false }];

  return parts
    .filter((p) => p !== "")
    .map((p) => ({
      text: p,
      match: lowerTerms.includes(p.toLowerCase()),
    }));
}

export function clearHighlights(): void {
  const marks = document.querySelectorAll(`mark.${HIGHLIGHT_CLASS}`);
  const parents = new Set<Node>();
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    const textNode = document.createTextNode(mark.textContent ?? "");
    parent.replaceChild(textNode, mark);
    parents.add(parent);
  }
  for (const parent of parents) {
    parent.normalize();
  }
}
