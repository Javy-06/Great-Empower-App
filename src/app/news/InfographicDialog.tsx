import type { RefObject } from "react";
import { X } from "lucide-react";
import type { NewsStory } from "@/data/news";

/**
 * Full-size infographic viewer. Native <dialog>: Esc closes, focus is contained by the browser,
 * and a tap on the backdrop closes it. Open with `ref.current?.showModal()`.
 */
export function InfographicDialog({
  story,
  dialogRef,
}: {
  story: NewsStory;
  dialogRef: RefObject<HTMLDialogElement | null>;
}) {
  return (
    <dialog
      ref={dialogRef}
      aria-label={`${story.infographic.alt.split(".")[0]} — full size`}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="m-0 h-full max-h-none w-full max-w-none bg-navy-950/95 p-0 backdrop:bg-navy-950/80"
    >
      <div className="sticky top-0 z-10 flex justify-end p-3">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Close infographic"
          autoFocus
        >
          <X size={20} aria-hidden />
        </button>
      </div>
      {/* Wider than a phone screen on purpose: pan to read, or pinch to zoom. */}
      <div className="overflow-x-auto px-3 pb-6">
        <img
          src={story.infographic.full}
          alt={story.infographic.alt}
          width={story.infographic.width}
          height={story.infographic.height}
          loading="lazy"
          className="mx-auto block h-auto w-[max(100%,48rem)] max-w-none lg:w-full lg:max-w-[1100px]"
        />
      </div>
    </dialog>
  );
}
