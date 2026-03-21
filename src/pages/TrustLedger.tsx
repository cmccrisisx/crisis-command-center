import { useState, useCallback, useRef, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck, Upload, Copy, Check, Loader2, FileText, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

async function computeHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Falling hex rain behind the hash display */
function MatrixRain() {
  const cols = 18;
  const hexChars = "0123456789abcdef";
  const [columns] = useState(() =>
    Array.from({ length: cols }, () => ({
      chars: Array.from({ length: 6 }, () => hexChars[Math.floor(Math.random() * 16)]),
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.07]" aria-hidden>
      <div className="flex justify-between h-full px-1">
        {columns.map((col, i) => (
          <div
            key={i}
            className="flex flex-col font-mono text-[9px] text-crisis-amber animate-matrix-fall"
            style={{
              animationDuration: `${col.duration}s`,
              animationDelay: `${col.delay}s`,
            }}
          >
            {col.chars.map((c, j) => (
              <span key={j} className="leading-tight">{c}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Typewriter effect for the SHA-256 hash reveal */
function AnimatedHash({ hash }: { hash: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!hash) { setDisplayed(""); setDone(false); return; }
    setDone(false);
    setDisplayed("");
    let i = 0;
    const speed = Math.max(8, Math.min(25, 1200 / hash.length));
    const timer = setInterval(() => {
      i++;
      setDisplayed(hash.slice(0, i));
      if (i >= hash.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [hash]);

  if (!hash) return <span className="text-muted-foreground/50">Upload a file to generate hash…</span>;

  return (
    <span className={`transition-colors duration-500 ${done ? "text-crisis-green" : "text-crisis-amber"}`}>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-3.5 bg-crisis-amber ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

export default function TrustLedger() {
  usePageTitle("Trust Ledger");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [hashPreview, setHashPreview] = useState("");
  const [title, setTitle] = useState("");
  const [executive, setExecutive] = useState("");
  const [minting, setMinting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["verified-communications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verified_communications")
        .select("*")
        .order("minted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    const hash = await computeHash(f);
    setHashPreview(hash);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleMint = async () => {
    if (!file || !user) return;
    setMinting(true);
    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("verify-communication", {
        body: {
          action: "mint",
          fileBase64: base64,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          documentTitle: title || file.name,
          authorizingExecutive: executive || "Unknown",
        },
      });
      if (error) throw error;
      toast.success("Communication anchored to the ledger", {
        description: `Hash: ${data.record.contentHash.slice(0, 16)}…`,
      });
      setFile(null);
      setHashPreview("");
      setTitle("");
      setExecutive("");
      queryClient.invalidateQueries({ queryKey: ["verified-communications"] });
    } catch (err: any) {
      toast.error("Minting failed", { description: err.message });
    } finally {
      setMinting(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncateHash = (hash: string) =>
    hash ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : "—";

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-crisis-amber" />
            <h1 className="text-xl sm:text-2xl font-bold">Trust Ledger: Asset Minting & Verification</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Secure corporate communications via immutable cryptographic records.
          </p>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left — Uploader */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                Upload Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-crisis-amber/60 bg-crisis-amber/5"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.mp4,.mov,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                {file ? (
                  <div className="flex items-center gap-3 justify-center">
                    <FileText className="w-5 h-5 text-crisis-amber" />
                    <div className="text-left">
                      <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop official press release or media here
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      PDF, DOCX, MP4, images
                    </p>
                  </>
                )}
              </div>

              <Input
                placeholder="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Authorizing Executive"
                value={executive}
                onChange={(e) => setExecutive(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Right — Minting Console */}
          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Minting Console
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative p-4 rounded-sm bg-background border border-border overflow-hidden">
                <MatrixRain />
                <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1 relative z-10">SHA-256 Hash</p>
                <p className="font-mono text-xs break-all relative z-10">
                  <AnimatedHash hash={hashPreview} />
                </p>
              </div>

              {hashPreview && (
                <div className="p-4 rounded-sm bg-background border border-border">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
                    Signature Preview
                  </p>
                  <p className="font-mono text-xs text-foreground/60">
                    HMAC will be generated server-side on anchor
                  </p>
                </div>
              )}

              <Button
                onClick={handleMint}
                disabled={!file || minting}
                className="w-full bg-crisis-amber hover:bg-crisis-amber/90 text-background font-semibold rounded-sm"
              >
                {minting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Anchoring…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Anchor to Blockchain
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
              Recently Secured Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No communications anchored yet. Upload your first document above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Date Minted</TableHead>
                      <TableHead>Transaction Hash</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">
                          {r.document_title}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {format(new Date(r.minted_at), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => copyText(r.content_hash, r.id)}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {truncateHash(r.content_hash)}
                            {copied === r.id ? (
                              <Check className="w-3 h-3 text-crisis-green" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          {r.status === "verified" ? (
                            <Badge className="bg-crisis-green/20 text-crisis-green border-crisis-green/30 text-[10px]">
                              Verified Authenticated
                            </Badge>
                          ) : (
                            <Badge className="bg-crisis-blue/20 text-crisis-blue border-crisis-blue/30 text-[10px] animate-pulse">
                              Anchoring…
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
