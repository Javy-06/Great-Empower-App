import { useEffect, useState, type RefObject } from "react";
import { Captions, CaptionsOff } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Caption picker for a <video>. It only lists caption/subtitle tracks the browser actually
 * loaded (authored WebVTT files attached with <track>). With none, it says so plainly — no
 * automatic transcription or translation happens in this app.
 */
export function CaptionControl({
  videoRef,
  dark,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  dark?: boolean;
}) {
  const [tracks, setTracks] = useState<Array<{ index: number; label: string; lang: string }>>([]);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const read = () => {
      const list = Array.from(video.textTracks)
        .map((t, index) => ({ t, index }))
        .filter(({ t }) => t.kind === "subtitles" || t.kind === "captions")
        .map(({ t, index }) => ({ index, label: t.label || t.language || `Track ${index + 1}`, lang: t.language }));
      setTracks(list);
      const showing = Array.from(video.textTracks).findIndex((t) => t.mode === "showing");
      setActive(showing >= 0 ? showing : null);
    };
    read();
    video.textTracks.addEventListener("addtrack", read);
    video.textTracks.addEventListener("removetrack", read);
    video.textTracks.addEventListener("change", read);
    return () => {
      video.textTracks.removeEventListener("addtrack", read);
      video.textTracks.removeEventListener("removetrack", read);
      video.textTracks.removeEventListener("change", read);
    };
  }, [videoRef]);

  const choose = (index: number | null) => {
    const video = videoRef.current;
    if (!video) return;
    Array.from(video.textTracks).forEach((t, i) => {
      t.mode = i === index ? "showing" : "disabled";
    });
    setActive(index);
  };

  if (tracks.length === 0) {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-semibold",
          dark ? "bg-white/10 text-white/75" : "bg-sunken text-ink-muted",
        )}
        data-testid="captions-unavailable"
      >
        <CaptionsOff size={14} aria-hidden /> Captions unavailable for this video
      </p>
    );
  }

  return (
    <div role="group" aria-label="Captions" className="flex flex-wrap items-center gap-1.5">
      <Captions size={18} className={dark ? "text-white/80" : "text-navy-900"} aria-hidden />
      {[{ index: null as number | null, label: "Off" }, ...tracks].map((t) => {
        const selected = active === t.index;
        return (
          <button
            key={t.label}
            type="button"
            aria-pressed={selected}
            onClick={() => choose(t.index)}
            className={cn(
              "h-10 rounded-full px-3.5 text-caption font-semibold",
              selected
                ? dark
                  ? "bg-white text-navy-950"
                  : "bg-navy-900 text-white"
                : dark
                  ? "bg-white/10 text-white"
                  : "bg-sunken text-navy-900",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
