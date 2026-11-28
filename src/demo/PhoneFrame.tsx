import { useEffect, useRef, useState, type Ref } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";

/** Outer size of the device: a 390×844 screen (an iPhone 13-class phone) plus the bezel. */
const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 12;
const DEVICE_W = SCREEN_W + BEZEL * 2;
const DEVICE_H = SCREEN_H + BEZEL * 2;

/**
 * A phone running the REAL GREAT EMPOWER app (an iframe of the App Demo), never a screenshot.
 * The app inside always lays out at 390px, so it shows the true mobile UI; the whole device is then
 * scaled down to fit the space it's given, keeping it legible on laptop screens.
 */
export function PhoneFrame({
  src,
  frameRef,
  maxScale = 1,
  title = "GREAT EMPOWER app, demo mode",
  className,
}: {
  src: string;
  frameRef?: Ref<HTMLIFrameElement>;
  maxScale?: number;
  title?: string;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      setScale(Math.max(0.45, Math.min(maxScale, width / DEVICE_W, height / DEVICE_H)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxScale]);

  return (
    <div ref={boxRef} className={className ?? "flex h-full w-full items-center justify-center"}>
      <div style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }} className="relative shrink-0">
        <div
          className="absolute left-0 top-0 origin-top-left rounded-[3.25rem] bg-[#0b0f14] shadow-[0_40px_80px_-24px_rgb(0_0_0/0.55)] ring-1 ring-white/10"
          style={{ width: DEVICE_W, height: DEVICE_H, padding: BEZEL, transform: `scale(${scale})` }}
          data-testid="demo-phone"
        >
          <div className="flex h-full w-full flex-col overflow-hidden rounded-[2.6rem] bg-navy-950">
            <div className="relative flex h-[47px] shrink-0 items-center justify-between px-8 text-[15px] font-semibold text-white" aria-hidden>
              <span>9:41</span>
              <span className="absolute left-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
              <span className="flex items-center gap-1.5">
                <Signal size={15} />
                <Wifi size={15} />
                <BatteryFull size={20} />
              </span>
            </div>
            <iframe ref={frameRef} title={title} src={src} className="min-h-0 w-full flex-1 border-0 bg-canvas" />
            <div className="flex h-[30px] shrink-0 items-center justify-center bg-surface" aria-hidden>
              <span className="h-1.5 w-32 rounded-full bg-ink" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
