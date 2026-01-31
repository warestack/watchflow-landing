export function Footer() {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container">
        <p className="text-sm text-muted-foreground text-center">
          {"Made by "}
          <a
            href="https://www.warestack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Warestack
          </a>
          {" — agentic governance for GitHub repositories."}
        </p>
      </div>
    </footer>
  );
}
