import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Crisis-X`;
    return () => {
      document.title = "Crisis-X — Crisis Intelligence Platform";
    };
  }, [title]);
}
