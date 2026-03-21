import { describe, it, expect, beforeEach } from "vitest";
import { highlightSegment, clearHighlights } from "@/content/highlighter";

describe("highlighter", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  it("wraps matching text in <mark> elements", () => {
    document.body.innerHTML = `<p id="target">Hello world from search</p>`;
    const el = document.getElementById("target")!;
    highlightSegment("/body[1]/p[1]", ["world"], new WeakRef(el));

    const marks = document.querySelectorAll("mark.bettersearch-highlight");
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe("world");
  });

  it("highlights multiple terms", () => {
    document.body.innerHTML = `<p id="target">The quick brown fox</p>`;
    const el = document.getElementById("target")!;
    highlightSegment("/body[1]/p[1]", ["quick", "fox"], new WeakRef(el));

    const marks = document.querySelectorAll("mark.bettersearch-highlight");
    expect(marks.length).toBe(2);
  });

  it("sets active class on first match", () => {
    document.body.innerHTML = `<p id="target">Hello world</p>`;
    const el = document.getElementById("target")!;
    highlightSegment("/body[1]/p[1]", ["world"], new WeakRef(el));

    const active = document.querySelector("mark.bettersearch-highlight-active");
    expect(active).not.toBeNull();
  });

  it("clears highlights by unwrapping marks", () => {
    document.body.innerHTML = `<p id="target">Hello world</p>`;
    const el = document.getElementById("target")!;
    highlightSegment("/body[1]/p[1]", ["world"], new WeakRef(el));

    expect(document.querySelectorAll("mark").length).toBe(1);

    clearHighlights();
    expect(document.querySelectorAll("mark").length).toBe(0);
    expect(document.querySelector("p")!.textContent).toBe("Hello world");
  });

  it("injects styles into head", () => {
    document.body.innerHTML = `<p id="target">Test text</p>`;
    const el = document.getElementById("target")!;
    highlightSegment("/body[1]/p[1]", ["Test"], new WeakRef(el));

    expect(document.getElementById("bettersearch-styles")).not.toBeNull();
  });
});
