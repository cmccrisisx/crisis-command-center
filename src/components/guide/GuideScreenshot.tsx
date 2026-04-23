import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GuideCallout {
  label: string;
  x: string;
  y: string;
}

interface GuideScreenshotProps {
  src: string;
  alt: string;
  caption: string;
  callouts?: GuideCallout[];
  className?: string;
}

export function GuideScreenshot({ src, alt, caption, callouts = [], className }: GuideScreenshotProps) {
  return (
    <figure className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-sm border border-border bg-card">
        <img src={src} alt={alt} className="w-full object-cover" loading="lazy" />
        {callouts.map((callout) => (
          <Badge
            key={`${callout.label}-${callout.x}-${callout.y}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 border border-primary/40 bg-background/95 text-[10px] font-mono uppercase tracking-wider text-foreground"
            style={{ left: callout.x, top: callout.y }}
          >
            {callout.label}
          </Badge>
        ))}
      </div>
      <figcaption className="text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}