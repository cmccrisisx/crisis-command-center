import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuideScreenshot } from "@/components/guide/GuideScreenshot";

interface GuideStepCardProps {
  step: string;
  title: string;
  purpose: string;
  action: string;
  expectation: string;
  whyItMatters: string;
  screenshot: {
    src: string;
    alt: string;
    caption: string;
    callouts?: { label: string; x: string; y: string }[];
  };
}

export function GuideStepCard({ step, title, purpose, action, expectation, whyItMatters, screenshot }: GuideStepCardProps) {
  return (
    <Card className="overflow-hidden border-border bg-card/70">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <CardHeader className="space-y-4 border-b border-border lg:border-b-0 lg:border-r">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary">{step}</p>
            <CardTitle className="mt-2 text-2xl font-mono">{title}</CardTitle>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-foreground">Purpose</p>
              <p className="mt-1">{purpose}</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-foreground">What to do</p>
              <p className="mt-1">{action}</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-foreground">What to expect</p>
              <p className="mt-1">{expectation}</p>
            </div>
            <div className="rounded-sm border border-border bg-surface-elevated p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-foreground">Why this matters</p>
                  <p className="mt-1 text-xs text-muted-foreground">{whyItMatters}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-5">
          <GuideScreenshot {...screenshot} />
        </CardContent>
      </div>
    </Card>
  );
}