import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import crisisLogo from "@/assets/crisis-x-logo.png";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home", exact: true },
  { to: "/about", label: "About" },
  { to: "/launch", label: "Launch" },
  { to: "/verify", label: "Verify" },
];

interface PublicNavProps {
  hideSignIn?: boolean;
}

export default function PublicNav({ hideSignIn }: PublicNavProps) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src={crisisLogo} alt="Crisis-X" className="h-7 w-auto" />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase hidden sm:inline">
            Crisis-X
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-colors",
                pathname === link.to || (!link.exact && pathname.startsWith(link.to + "/"))
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {link.label}
            </Link>
          ))}
          {!hideSignIn && (
            <Button size="sm" asChild className="ml-3 font-mono text-xs uppercase tracking-wider">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {!hideSignIn && (
            <Button size="sm" asChild className="font-mono text-xs uppercase tracking-wider">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background border-border">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-sm font-mono text-sm uppercase tracking-wider transition-colors",
                      pathname === link.to || (!link.exact && pathname.startsWith(link.to + "/"))
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
