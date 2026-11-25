import { BatteryFull, Signal, Wifi } from "lucide-react";

/**
 * Optional desktop review aid: open the app with `?preview=phone` to see it inside a phone frame.
 * The frame reserves a status-bar zone (camera island, time, icons) and a home-indicator zone,
 * the way a real phone's safe areas do, so nothing in the app is covered. Real phones never see
 * this — they use their own status bar and safe-area insets.
 */
export function PhonePreview() {
  const src = `${window.location.pathname}${window.location.hash || "#app/home"}`;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#1b3a63,#06131f_70%)] p-6">
      <div className="relative rounded-[3.25rem] bg-[#0b0f14] p-3 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/10">
        <div className="flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[2.6rem] bg-navy-950">
          {/* Status bar safe area */}
          <div className="relative flex h-[47px] shrink-0 items-center justify-between px-8 text-[15px] font-semibold text-white">
            <span>9:41</span>
            <span className="absolute left-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-black" aria-hidden />
            <span className="flex items-center gap-1.5" aria-hidden>
              <Signal size={15} />
              <Wifi size={15} />
              <BatteryFull size={20} />
            </span>
          </div>
          <iframe title="GREAT EMPOWER phone preview" src={src} className="min-h-0 w-full flex-1 border-0 bg-canvas" />
          {/* Home indicator safe area */}
          <div className="flex h-[30px] shrink-0 items-center justify-center bg-surface" aria-hidden>
            <span className="h-1.5 w-32 rounded-full bg-ink" />
          </div>
        </div>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-caption text-white/50">
        Phone preview (desktop only) · remove “?preview=phone” to exit
      </p>
    </div>
  );
}
