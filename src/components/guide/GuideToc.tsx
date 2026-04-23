import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GuideTocProps {
  sections: { id: string; title: string }[];
}

export function GuideToc({ sections }: GuideTocProps) {
  return (
    <Card className="border-border bg-card/70 lg:sticky lg:top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono uppercase tracking-[0.22em]">Journey map</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "block rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">Jump</span>
            <span className="mt-1 block">{section.title}</span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}