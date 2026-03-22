import { RefreshCw, Monitor, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusBarProps {
  pageUrl: string | null;
  lastIndexedAt: number | null;
  indexing: boolean;
  onReindex: () => void;
  theme: "light" | "dark" | "system";
  onThemeToggle: () => void;
}

const themeIcons = { system: Monitor, light: Sun, dark: Moon } as const;
const themeLabels = { system: "System", light: "Light", dark: "Dark" } as const;

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function StatusBar({
  pageUrl,
  lastIndexedAt,
  indexing,
  onReindex,
  theme,
  onThemeToggle,
}: StatusBarProps) {
  const ThemeIcon = themeIcons[theme];

  return (
    <div className="relative flex items-center gap-2 border-t border-border px-3 py-1.5 text-xs text-muted-foreground overflow-visible">
      {lastIndexedAt && (
        <span className="size-2 rounded-full bg-green-500 shrink-0" />
      )}
      <div className="flex-1 min-w-0 flex items-center overflow-x-hidden">
        {pageUrl ? (
          <Tooltip>
            <TooltipTrigger className="overflow-hidden">
              <span className="truncate block cursor-default">
                {pageUrl}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" align="start">
              <div className="flex flex-col gap-0.5">
                <div className="break-all">{pageUrl}</div>
                {lastIndexedAt && (
                  <div className="text-muted-foreground">Indexed at {formatTimestamp(lastIndexedAt)}</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onReindex}
            disabled={indexing}
            aria-label="Re-index"
          >
            <RefreshCw className={indexing ? "animate-spin" : ""} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Rebuild index</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onThemeToggle}
            aria-label={`Theme: ${theme}`}
          >
            <ThemeIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Theme: {themeLabels[theme]}</TooltipContent>
      </Tooltip>
    </div>
  );
}
