import { Star, Key, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToken } from "@/hooks/use-token";
import { useGitHubStars } from "@/hooks/use-github-stars";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const { hasToken, manageToken } = useToken();
  const { starCount, isLoading } = useGitHubStars();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-semibold tracking-tight">watchflow</span>
          <span className="text-xs text-muted-foreground font-mono">.dev</span>
        </div>

        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={manageToken}
                  className="rounded-none gap-2"
                >
                  {hasToken ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="hidden sm:inline">Manage token</span>
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Token</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-left">
                <p className="font-medium mb-1">
                  {hasToken ? "Manage GitHub Token" : "Add GitHub Token"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Access private repositories</li>
                  <li>• Avoid API rate limits (60 → 5,000 req/hr)</li>
                  <li>• Create PRs directly from analysis</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="sm" asChild className="rounded-none">
            <a
              href="https://github.com/warestack/watchflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Star</span>
              {!isLoading && starCount !== null && (
                <span className="text-xs text-muted-foreground">
                  {starCount.toLocaleString()}
                </span>
              )}
            </a>
          </Button>
          <Button size="sm" asChild className="rounded-none">
            <a
              href="https://github.com/marketplace/watchflow"
              target="_blank"
              rel="noopener noreferrer"
            >
              View it on marketplace
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
