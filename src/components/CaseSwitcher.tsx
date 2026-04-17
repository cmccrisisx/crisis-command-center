import { Check, ChevronsUpDown, Layers } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useActiveCase } from "@/hooks/useActiveCase";
import { cn } from "@/lib/utils";
import { RiskBadge } from "@/components/RiskBadge";

const RISK_DOT: Record<string, string> = {
  low: "bg-crisis-green",
  medium: "bg-crisis-amber",
  high: "bg-crisis-red",
  critical: "bg-crisis-red",
};

export function CaseSwitcher() {
  const { cases, signalCounts, activeCaseId, activeCase, setActiveCaseId, isLoading } = useActiveCase();
  const [open, setOpen] = useState(false);

  const label = activeCase?.title ?? "All cases";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className="h-8 gap-2 font-mono text-xs max-w-[14rem] sm:max-w-[18rem]"
          disabled={isLoading}
          data-tour="case-switcher"
        >
          <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search cases…" className="font-mono text-xs h-9" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-xs font-mono text-muted-foreground">
              No matching case.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-cases"
                onSelect={() => {
                  setActiveCaseId(null);
                  setOpen(false);
                }}
                className="font-mono text-xs"
              >
                <Check
                  className={cn(
                    "mr-2 h-3.5 w-3.5",
                    activeCaseId === null ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="flex-1">All cases</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {cases.length}
                </span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Cases">
              {cases.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.title} ${c.type}`}
                  onSelect={() => {
                    setActiveCaseId(c.id);
                    setOpen(false);
                  }}
                  className="font-mono text-xs items-start gap-2"
                >
                  <Check
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      activeCaseId === c.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 rounded-full shrink-0",
                      RISK_DOT[c.risk_level] ?? "bg-muted-foreground"
                    )}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-foreground">{c.title}</span>
                      <RiskBadge level={c.risk_level} size="sm" />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {c.status} · {c.type}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
