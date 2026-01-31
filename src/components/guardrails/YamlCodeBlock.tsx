import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YamlCodeBlockProps {
  yaml: string;
}

export function YamlCodeBlock({ yaml }: YamlCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="panel overflow-hidden rounded-none">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="terminal-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="font-mono text-sm">.watchflow/rules.yaml</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="rounded-none">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="code-block p-4 overflow-x-auto text-xs leading-relaxed rounded-none">
        <code>{yaml}</code>
      </pre>
    </div>
  );
}
