import { GitPullRequest, Download, Key, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PRActionButtonsProps {
  hasToken: boolean;
  isCreatingPR: boolean;
  onCreatePR: () => void;
  onDownload: () => void;
  onManageToken: () => void;
}

export function PRActionButtons({
  hasToken,
  isCreatingPR,
  onCreatePR,
  onDownload,
  onManageToken,
}: PRActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        className="gap-2 rounded-none"
        onClick={onCreatePR}
        disabled={isCreatingPR || !hasToken}
      >
        <GitPullRequest className="h-4 w-4" />
        {isCreatingPR ? "Creating PR..." : "Create Pull Request"}
      </Button>
      <Button variant="outline" onClick={onDownload} className="rounded-none">
        <Download className="h-4 w-4 mr-2" />
        Download rules.yaml
      </Button>
      <Button variant="outline" onClick={onManageToken} className="rounded-none gap-2">
        {hasToken ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-success" />
            Token ✓
          </>
        ) : (
          <>
            <Key className="h-4 w-4" />
            Token
          </>
        )}
      </Button>
    </div>
  );
}
