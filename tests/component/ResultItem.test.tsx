import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ResultItem } from "@/sidepanel/components/ResultItem";
import type { SearchResult } from "@/shared/types";

const mockResult: SearchResult = {
  id: "result-seg-0",
  score: 5,
  snippet: "Hello <mark>world</mark>",
  segmentId: "seg-0",
  terms: ["world"],
};

describe("ResultItem", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders snippet content", () => {
    render(
      <ResultItem result={mockResult} isActive={false} onClick={vi.fn()} />,
    );
    const button = screen.getByRole("button");
    expect(button).toBeTruthy();
    expect(button.innerHTML).toContain("<mark>world</mark>");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <ResultItem result={mockResult} isActive={false} onClick={onClick} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies secondary style when isActive", () => {
    render(
      <ResultItem result={mockResult} isActive={true} onClick={vi.fn()} />,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-secondary");
  });

  it("applies ghost style when inactive", () => {
    render(
      <ResultItem result={mockResult} isActive={false} onClick={vi.fn()} />,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("hover:bg-muted");
  });
});
