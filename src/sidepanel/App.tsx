import { useEffect, useRef } from "react";
import { Search, ShieldAlert } from "lucide-react";
import { useSearch } from "./hooks/useSearch";
import { useTheme } from "./hooks/useTheme";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResultItem } from "./components/ResultItem";
import { StatusBar } from "./components/StatusBar";
import type { SearchResult } from "@/shared/types";

export function App() {
  const {
    indexStatus,
    indexProgress,
    query,
    updateQuery,
    results,
    activeResultId,
    highlightResult,
    error,
    pageUrl,
    lastIndexedAt,
    reindex,
    triggerSearch,
  } = useSearch();
  const { theme, cycleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const indexing = indexStatus === "indexing";

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        {indexStatus === "unsupported" ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Alert className="max-w-xs">
              <ShieldAlert />
              <AlertTitle>Can't search this page</AlertTitle>
              <AlertDescription>
                Browser-internal pages can't be accessed by extensions. Navigate to a website to start searching.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Find on page..."
                  value={query}
                  onChange={(e) => updateQuery(e.target.value)}
                  className="pr-16"
                />
                {query && (
                  <Badge
                    variant="secondary"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {results.length}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={triggerSearch}
                aria-label="Search"
              >
                <Search />
              </Button>
            </div>

            {indexStatus === "error" && (
              <p className="text-sm text-destructive">
                Something went wrong: {error ?? "Unable to index this page"}
              </p>
            )}

            {indexStatus === "ready" && query && results.length === 0 && (
              <p className="text-sm text-muted-foreground px-1">
                No matches on this page.
              </p>
            )}

            {results.length > 0 && (
              <ScrollArea className="flex-1 overflow-hidden">
                <div className="flex flex-col gap-0.5 px-0.5">
                  {results.map((result: SearchResult) => (
                    <ResultItem
                      key={result.id}
                      result={result}
                      isActive={result.id === activeResultId}
                      onClick={() => highlightResult(result)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </div>

      {indexing && (
        <div className="py-1 px-2 flex items-center gap-2">
          <div className="text-xs text-muted-foreground shrink-0">Indexing</div>
          <Progress value={indexProgress} className="flex-1" />
        </div>
      )}

      <StatusBar
        pageUrl={pageUrl}
        lastIndexedAt={lastIndexedAt}
        indexing={indexing}
        onReindex={reindex}
        theme={theme}
        onThemeToggle={cycleTheme}
      />
    </div>
  );
}
