import { AlertCircle, Key, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthenticationNotice() {
  return (
    <div className="p-6 bg-muted border border-border rounded-none">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-base">Authentication Required</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          To create a pull request, you need either:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-background border border-border rounded-none">
            <Key className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <strong className="text-sm block mb-1">GitHub Personal Access Token</strong>
              <span className="text-xs text-muted-foreground">
                Click the "Token" button below to add your token
              </span>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            or
          </div>
          <div className="flex items-start gap-3 p-3 bg-background border border-border rounded-none">
            <Github className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <strong className="text-sm block mb-1">Install GitHub App</strong>
              <span className="text-xs text-muted-foreground">
                Install the Watchflow app first, then follow the instructions in the first PR that gets created
              </span>
            </div>
            <a
              href="https://github.com/apps/watchflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button variant="outline" size="sm" className="rounded-none">
                Install App
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
