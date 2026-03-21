import { useState, useCallback, useRef, useEffect } from "react";
import PublicNav from "@/components/PublicNav";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import crisisLogo from "@/assets/crisis-x-logo.png";
import {
  ShieldCheck, ShieldAlert, Upload, Loader2, FileText, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

type VerifyState = "idle" | "scanning" | "verified" | "tampered";

interface VerifiedRecord {
  documentTitle: string;
  authorizingExecutive: string;
  mintedAt: string;
  contentHash: string;
  signature: string;
  chainTxHash: string | null;
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

export default function Verify() {
  usePageTitle("Verify — Crisis-X");
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<VerifyState>("idle");
  const [record, setRecord] = useState<VerifiedRecord | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hashChecked = useRef(false);

  // Auto-verify if ?hash= is present
  useEffect(() => {
    const hash = searchParams.get("hash");
    if (!hash || hashChecked.current) return;
    hashChecked.current = true;
    setState("scanning");
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    fetch(`https://${projectId}.supabase.co/functions/v1/verify-communication`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-hash", contentHash: hash }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.verified) {
          setRecord(data.record);
          setState("verified");
        } else {
          setState("tampered");
        }
      })
      .catch(() => setState("tampered"));
  }, [searchParams]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setState("idle");
    setRecord(null);
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

  const handleScan = async () => {
    if (!file) return;
    setState("scanning");
    try {
      const base64 = await fileToBase64(file);
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/verify-communication`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify", fileBase64: base64 }),
        }
      );
      const data = await res.json();
      if (data.verified) {
        setRecord(data.record);
        setState("verified");
      } else {
        setState("tampered");
      }
    } catch {
      setState("tampered");
    }
  };

  const reset = () => {
    setFile(null);
    setState("idle");
    setRecord(null);
  };

  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col">
      <PublicNav />
      {/* Header */}
      <header className="flex flex-col items-center pt-20 pb-6 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1">
          Public Trust Verification Portal
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Confirm the authenticity of corporate communications.
        </p>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 pb-16">
        <Card className="w-full max-w-lg bg-card border-border">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {(state === "idle" || state === "scanning") && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-sm p-10 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-primary/60 bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                  {file ? (
                    <div className="flex items-center gap-3 justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium truncate max-w-[220px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Upload document or video to verify cryptographic signature
                      </p>
                    </>
                  )}
                </div>

                <Button
                  onClick={handleScan}
                  disabled={!file || state === "scanning"}
                  className="w-full rounded-sm"
                >
                  {state === "scanning" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Scanning Ledger…
                    </>
                  ) : (
                    "Scan File"
                  )}
                </Button>
              </>
            )}

            {/* Verified */}
            {state === "verified" && record && (
              <div className="text-center space-y-5">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-crisis-green/10 border-2 border-crisis-green/40 mx-auto">
                  <ShieldCheck className="w-10 h-10 text-crisis-green" />
                </div>
                <h2 className="text-2xl font-bold text-crisis-green">AUTHENTIC & VERIFIED</h2>
                <div className="bg-background border border-border rounded-sm p-4 text-left space-y-2.5">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">Issuer</p>
                    <p className="text-sm font-medium">{record.authorizingExecutive}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">Document</p>
                    <p className="text-sm">{record.documentTitle}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">
                      Original Timestamp
                    </p>
                    <p className="text-sm font-mono">
                      {format(new Date(record.mintedAt), "MMM dd, yyyy HH:mm:ss z")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">
                      Content Hash
                    </p>
                    <p className="text-xs font-mono break-all text-muted-foreground">
                      {record.contentHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">
                      Blockchain Ledger
                    </p>
                    <p className="text-sm">Crisis-X Trust Network</p>
                  </div>
                </div>
                <Button onClick={reset} variant="outline" className="rounded-sm">
                  Verify Another
                </Button>
              </div>
            )}

            {/* Tampered */}
            {state === "tampered" && (
              <div className="text-center space-y-5">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/40 mx-auto">
                  <ShieldAlert className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-destructive">UNVERIFIED / TAMPERED</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  The cryptographic hash of this file does not match any official records. This
                  document may have been altered or is entirely synthetic.
                </p>
                <Button onClick={reset} variant="outline" className="rounded-sm">
                  Try Another File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border/30 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by Crisis-X Trust Infrastructure
        </p>
        <a
          href="/about"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
        >
          Learn about cryptographic hashing <ExternalLink className="w-3 h-3" />
        </a>
      </footer>
    </div>
  );
}
