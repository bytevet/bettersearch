import type { SearchResult } from "@/shared/types";
import { Button } from "@/components/ui/button";

interface ResultItemProps {
  result: SearchResult;
  isActive: boolean;
  onClick: () => void;
}

export function ResultItem({ result, isActive, onClick }: ResultItemProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      onClick={onClick}
      className="w-full justify-start h-auto py-1.5 px-2"
    >
      <span
        className="line-clamp-2 text-left whitespace-normal [&>mark]:bg-yellow-200 [&>mark]:rounded-sm"
        dangerouslySetInnerHTML={{ __html: result.snippet }}
      />
    </Button>
  );
}
