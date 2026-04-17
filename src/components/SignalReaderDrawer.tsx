import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SignalReaderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  fallbackTitle?: string;
  fallbackExcerpt?: string;
}

interface ScrapeResult {
  url: string;
  markdown: string;
  metadata: { title?: string; description?: string; sourceURL?: string };
}

export function SignalReaderDrawer({
  open,
  onOpenChange,
  url,
  fallbackTitle,
  fallbackExcerpt,
}: SignalReaderDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !url) {
      setResult(null);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("firecrawl-scrape", {
          body: { url },
        });
        if (cancelled) return;
        if (fnErr) throw fnErr;
        if (!data?.success) throw new Error(data?.error || "Scrape failed");
        setResult(data as ScrapeResult);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load article";
        setError(msg);
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  const title = result?.metadata?.title || fallbackTitle || "Source article";
  const description = result?.metadata?.description || fallbackExcerpt;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono text-base leading-tight pr-8">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-xs font-mono">{description}</SheetDescription>
          )}
        </SheetHeader>

        {url && (
          <div className="mt-3 flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="font-mono text-xs gap-1.5">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Open original
              </a>
            </Button>
            <span className="text-[10px] font-mono text-muted-foreground truncate">
              {(() => {
                try {
                  return new URL(url).hostname.replace(/^www\./, "");
                } catch {
                  return url;
                }
              })()}
            </span>
          </div>
        )}

        <div className="mt-4">
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Fetching article…
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-9/12" />
            </div>
          )}

          {error && !loading && (
            <p className="text-xs font-mono text-crisis-red">
              {error}. You can still{" "}
              <a
                href={url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                open the original article
              </a>
              .
            </p>
          )}

          {!loading && !error && result?.markdown && (
            <article className="prose prose-sm dark:prose-invert max-w-none font-sans">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.markdown}</ReactMarkdown>
            </article>
          )}

          {!loading && !error && result && !result.markdown && (
            <p className="text-xs font-mono text-muted-foreground">
              No readable content was extracted. Open the original article instead.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
