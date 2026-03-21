import { describe, it, expect, beforeEach } from "vitest";
import { extractSegments } from "@/content/extractor";

describe("extractSegments", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("extracts text from simple paragraphs", () => {
    document.body.innerHTML = `
      <p>Hello world</p>
      <p>Another paragraph</p>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(2);
    expect(segments[0].text).toBe("Hello world");
    expect(segments[1].text).toBe("Another paragraph");
  });

  it("skips script and style elements", () => {
    document.body.innerHTML = `
      <p>Visible text</p>
      <script>console.log("hidden")</script>
      <style>.hidden { display: none }</style>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe("Visible text");
  });

  it("skips hidden elements (inline style)", () => {
    document.body.innerHTML = `
      <p>Visible</p>
      <p style="display: none">Hidden by inline style</p>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe("Visible");
  });

  it("skips elements with hidden attribute", () => {
    document.body.innerHTML = `
      <p>Visible</p>
      <p hidden>Hidden by attribute</p>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe("Visible");
  });

  it("skips elements with visibility hidden", () => {
    document.body.innerHTML = `
      <p>Visible</p>
      <p style="visibility: hidden">Invisible but takes space</p>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe("Visible");
  });

  it("skips nested content inside hidden parent", () => {
    document.body.innerHTML = `
      <p>Visible</p>
      <div style="display: none">
        <p>Nested hidden text</p>
        <p>More hidden text</p>
      </div>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe("Visible");
  });

  it("splits on block elements", () => {
    document.body.innerHTML = `
      <div>First block</div>
      <div>Second block</div>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(2);
  });

  it("combines inline text within a block", () => {
    document.body.innerHTML = `
      <p>Hello <span>beautiful</span> world</p>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe("Hello beautiful world");
  });

  it("skips segments shorter than min length", () => {
    document.body.innerHTML = `
      <p>OK</p>
      <p>This is long enough</p>
    `;
    const segments = extractSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe("This is long enough");
  });

  it("generates valid xpaths", () => {
    document.body.innerHTML = `<div><p>Test content</p></div>`;
    const segments = extractSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].xpath).toContain("/");
  });

  it("handles nested blocks", () => {
    document.body.innerHTML = `
      <article>
        <h1>Title</h1>
        <p>Content here</p>
      </article>
    `;
    const segments = extractSegments();
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("handles empty body", () => {
    document.body.innerHTML = "";
    const segments = extractSegments();
    expect(segments.length).toBe(0);
  });
});
