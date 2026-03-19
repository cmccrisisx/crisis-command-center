import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Trash2, Square, ThumbsUp, ThumbsDown, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrisisChat } from "@/hooks/useCrisisChat";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_STARTERS = [
  { label: "🔥 Triage a crisis", prompt: "I have an active crisis situation. Help me triage it — what's the severity, recommended response time, and top 3 actions?" },
  { label: "📝 Draft a response", prompt: "Help me draft a holding statement for a developing situation" },
  { label: "🛡️ Reputation check", prompt: "Walk me through how to assess our current brand health and reputation risk score" },
  { label: "💀 Cancel culture playbook", prompt: "We're getting pile-on backlash on social media. What's the playbook?" },
  { label: "📊 Stakeholder map", prompt: "Help me prioritize which stakeholders to address first in a crisis" },
  { label: "⚡ Platform strategy", prompt: "What's the best response strategy across Twitter/X, TikTok, LinkedIn, and Instagram?" },
];

const FOLLOW_UP_CHIPS = [
  "Draft a response for this",
  "What's the worst-case scenario?",
  "How do we measure recovery?",
  "Who should we talk to first?",
  "Run a scenario simulation",
];

export function CrisisChat() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [reactions, setReactions] = useState<Record<number, "up" | "down">>({});
  const { messages, isLoading, error, historyLoaded, send, clear, stop } = useCrisisChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    send(trimmed);
  };

  const handleReaction = (index: number, type: "up" | "down") => {
    setReactions((prev) => ({
      ...prev,
      [index]: prev[index] === type ? undefined! : type,
    }));
  };

  const panelSize = expanded
    ? "w-[680px] h-[700px]"
    : "w-[380px] h-[520px]";

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
            data-tour="chat-bubble"
          >
            <Button
              onClick={() => setOpen(true)}
              className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 transition-all"
              size="icon"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -top-10 right-0 whitespace-nowrap bg-card border border-border text-card-foreground text-xs px-3 py-1.5 rounded-sm shadow-md"
              >
                Ask CX anything ⚡
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            layout
            className={cn(
              "fixed bottom-6 right-6 z-50 flex flex-col bg-card border border-border rounded-sm shadow-2xl overflow-hidden transition-all duration-200",
              panelSize
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-crisis-green animate-pulse" />
                <span className="font-mono text-sm font-semibold text-foreground tracking-wide">
                  CX
                </span>
                <span className="text-xs text-muted-foreground">
                  Reputation Expert
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setExpanded(!expanded)}
                  title={expanded ? "Minimize" : "Expand"}
                >
                  {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => { clear(); setReactions({}); }}
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {!historyLoaded && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Loading chat history...
                  </div>
                </div>
              )}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
                  <div className="text-4xl">🛡️</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      yo, i'm CX
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Your reputation management expert. I've seen every type of crisis — from viral TikToks to boardroom meltdowns. Let's protect your brand. 🔥
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                    {QUICK_STARTERS.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => send(q.prompt)}
                        className="text-xs px-2.5 py-1.5 rounded-sm border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-primary/30 transition-colors"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i}>
                  <div
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] text-sm rounded-sm px-3 py-2",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                  {/* Reactions for assistant messages */}
                  {msg.role === "assistant" && !isLoading && (
                    <div className="flex items-center gap-1 mt-1 ml-1">
                      <button
                        onClick={() => handleReaction(i, "up")}
                        className={cn(
                          "p-1 rounded-sm transition-colors",
                          reactions[i] === "up"
                            ? "text-crisis-green bg-crisis-green/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleReaction(i, "down")}
                        className={cn(
                          "p-1 rounded-sm transition-colors",
                          reactions[i] === "down"
                            ? "text-crisis-red bg-crisis-red/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Personality loading indicator */}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground text-xs rounded-sm px-3 py-2 font-mono flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-crisis-amber animate-pulse" />
                    CX is cooking...
                  </div>
                </div>
              )}

              {/* Follow-up chips after last assistant message */}
              {messages.length > 0 &&
                messages[messages.length - 1]?.role === "assistant" &&
                !isLoading && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {FOLLOW_UP_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => send(chip)}
                        className="text-xs px-2 py-1 rounded-sm border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-primary/30 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask CX anything..."
                  className="flex-1 bg-muted/50 border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                {isLoading ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 shrink-0"
                    onClick={stop}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    disabled={!input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
