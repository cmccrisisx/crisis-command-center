import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Constants } from "@/integrations/supabase/types";

export function CreateCrisisDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("operational");
  const [riskLevel, setRiskLevel] = useState<string>("medium");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("operational");
    setRiskLevel("medium");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase.from("crises").insert({
      title: title.trim(),
      description: description.trim(),
      type: type as "pr" | "regulatory" | "operational",
      risk_level: riskLevel as "low" | "medium" | "high" | "critical",
      status: "detected",
      created_by: user.id,
    });

    setLoading(false);
    if (error) {
      toast.error("Failed to create crisis", { description: error.message });
      return;
    }

    toast.success("Crisis created", { description: title });
    queryClient.invalidateQueries({ queryKey: ["dashboard-crisis"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-signal-stats"] });
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-xs uppercase tracking-wider">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Crisis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">Declare New Crisis</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a new crisis event to begin tracking and response.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crisis-title" className="text-xs font-mono uppercase tracking-wider">Title</Label>
            <Input
              id="crisis-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Network outage in Lagos region"
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crisis-desc" className="text-xs font-mono uppercase tracking-wider">Description</Label>
            <Textarea
              id="crisis-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the crisis situation..."
              maxLength={2000}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.crisis_type.map((t) => (
                    <SelectItem key={t} value={t} className="uppercase font-mono text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Risk Level</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.risk_level.map((r) => (
                    <SelectItem key={r} value={r} className="uppercase font-mono text-xs">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !title.trim()} className="font-mono text-xs uppercase tracking-wider">
              {loading ? "Creating…" : "Declare Crisis"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
