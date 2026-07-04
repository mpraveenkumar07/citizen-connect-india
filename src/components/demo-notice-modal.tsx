import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "civicos.demo-notice.seen";

export function DemoNoticeModal() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setClosing(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-notice-title"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
        closing ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      {/* Overlay */}
      <button
        aria-label="Close notice"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-md rounded-2xl border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 ${
          closing ? "animate-scale-out" : "animate-scale-in"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))",
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </button>

        <h2
          id="demo-notice-title"
          className="pr-6 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
        >
          🚀 Demo Version Notice
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          This is a demo version of our application. To make it easy for everyone to explore the
          platform, we have temporarily disabled Sign In, Sign Up, and all user authentication
          features. No login or account creation is required. Simply explore and experience all
          the available features. Thank you for trying our application!
        </p>

        <div className="mt-6 flex justify-end">
          <Button onClick={close} className="rounded-full px-5">
            OK, Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
