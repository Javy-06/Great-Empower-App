import { useEffect, useRef, useState, type RefObject } from "react";
import { rewardsActions, useRewards } from "@/rewards/store";
import { WatchMeter, requiredWatchSeconds, watchKey } from "@/rewards/verification";

/** Report credited time roughly every 15 s of watching, and whenever playback stops. */
const REPORT_EVERY_SECONDS = 15;

/**
 * Tracks VALID watch time for one video edition, event-driven (no polling):
 *  - counts only while the video is playing, the page is visible and the user isn't seeking;
 *  - pause, seeking, buffering, end, hidden tab, leaving the page and unmount all stop counting;
 *  - credited seconds are reported to the rewards layer (cloud: the server bounds them by real
 *    elapsed time and pays once the requirement is met).
 * Time accumulates across visits; already-earned videos are not tracked.
 */
export function useWatchTime(videoRef: RefObject<HTMLVideoElement | null>, videoId: string, lang: string) {
  const rewards = useRewards();
  const required = requiredWatchSeconds(videoId, lang) ?? 0;
  const earned = rewards.earned.includes(`video-finished:${videoId}`);
  const saved = rewards.watch?.[watchKey(videoId, lang)] ?? 0;
  const [live, setLive] = useState(0); // credited locally, not yet confirmed by a report
  const [justEarned, setJustEarned] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const active = !earned && required > 0;

  // Sends are chained so reports never overlap and arrive in order.
  const chain = useRef(Promise.resolve());
  const meter = useRef(new WatchMeter());

  useEffect(() => {
    if (!active) return;
    const v = videoRef.current;
    if (!v) return;
    const m = new WatchMeter();
    meter.current = m;
    let startedClock = false;
    let shown = 0;

    const report = (seconds: number) => {
      chain.current = chain.current.then(async () => {
        const r = await rewardsActions.recordWatch(videoId, lang, seconds);
        if (!r.ok) {
          // Keep the time for the next report rather than losing it on a network blip.
          if (seconds > 0) m.pending += seconds;
          setError(r.error);
          return;
        }
        setError(null);
        if (r.earned) setJustEarned(r.points);
      });
    };
    const now = () => performance.now();
    const visible = () => document.visibilityState === "visible";
    const flush = () => {
      const s = m.take();
      if (s > 0) report(s);
      shown = 0;
      setLive(0);
    };
    const open = () => {
      if (v.paused || v.seeking || v.ended || !visible()) return;
      if (!startedClock) {
        startedClock = true;
        report(0); // starts the server's clock for this edition
      }
      m.start(now(), v.currentTime);
    };
    const close = () => {
      m.stop(now(), v.currentTime);
      flush();
    };
    const onTime = () => {
      if (!m.running) return;
      m.tick(now(), v.currentTime);
      const whole = Math.floor(m.pending);
      if (whole !== shown) {
        shown = whole;
        setLive(whole);
      }
      if (m.pending >= REPORT_EVERY_SECONDS) flush();
    };
    const onVisibility = () => (visible() ? open() : close());

    v.addEventListener("playing", open);
    v.addEventListener("seeked", open);
    v.addEventListener("timeupdate", onTime);
    for (const e of ["pause", "seeking", "waiting", "ended", "emptied"]) v.addEventListener(e, close);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", close);
    return () => {
      v.removeEventListener("playing", open);
      v.removeEventListener("seeked", open);
      v.removeEventListener("timeupdate", onTime);
      for (const e of ["pause", "seeking", "waiting", "ended", "emptied"]) v.removeEventListener(e, close);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", close);
      close(); // leaving the page
    };
  }, [active, videoRef, videoId, lang]);

  return {
    required,
    watched: Math.min(required, saved + live),
    earned,
    justEarned,
    error,
  };
}
