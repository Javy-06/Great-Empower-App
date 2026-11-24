import { useState } from "react";
import { Bookmark, Clock3, PlayCircle, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";

type Art = "shield" | "growth" | "umbrella";

/** Geometric illustration header — the default visual for lessons without photography. */
function LessonArt({ art, tone }: { art: Art; tone: "teal" | "navy" | "crimson" }) {
  const bg = { teal: "bg-teal-50", navy: "bg-navy-50", crimson: "bg-crimson-50" }[tone];
  const main = { teal: "#297E85", navy: "#0F294A", crimson: "#C8102E" }[tone];
  const soft = { teal: "#B0DCDE", navy: "#C6D3E6", crimson: "#F6C4CD" }[tone];
  return (
    <div className={cn("relative h-full w-full overflow-hidden", bg)} aria-hidden>
      <svg
        viewBox="0 0 320 160"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="270" cy="20" r="70" fill={soft} opacity="0.6" />
        <circle cx="40" cy="150" r="44" fill={soft} opacity="0.5" />
        {art === "shield" && (
          <g transform="translate(130 28)">
            <path d="M30 0 60 12v26c0 22-13 38-30 46C13 76 0 60 0 38V12L30 0Z" fill={main} />
            <path
              d="m17 42 9 9 18-20"
              fill="none"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
        {art === "growth" && (
          <g transform="translate(100 40)">
            {[18, 34, 52, 76].map((h, i) => (
              <rect
                key={i}
                x={i * 30}
                y={90 - h}
                width="20"
                height={h}
                rx="5"
                fill={i === 3 ? main : soft}
              />
            ))}
            <path
              d="M6 58 40 40l30 8 44-34"
              fill="none"
              stroke={main}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="114" cy="14" r="6" fill={main} />
          </g>
        )}
        {art === "umbrella" && (
          <g transform="translate(110 26)">
            <path d="M50 4C22 4 2 26 0 52h100C98 26 78 4 50 4Z" fill={main} />
            <path
              d="M50 52v40c0 8-12 8-12 0"
              fill="none"
              stroke={main}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M25 52c0-20 10-40 25-48 15 8 25 28 25 48"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.35"
              strokeWidth="3"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export function LessonCard({
  lessonId,
  category,
  title,
  description,
  minutes,
  points,
  progress,
  art = "shield",
  tone = "teal",
  photo,
  level = "Beginner",
  status,
  onClick,
  onBookmark,
  isBookmarked = false,
  imageSource,
}: {
  lessonId?: string;
  category: string;
  title: string;
  description?: string;
  minutes: number;
  points: number;
  progress?: number;
  art?: Art;
  tone?: "teal" | "navy" | "crimson";
  photo?: boolean;
  level?: string;
  status?: "Completed" | "In progress" | "Upcoming";
  onClick?: (lessonId?: string) => void;
  onBookmark?: (lessonId?: string) => void;
  isBookmarked?: boolean;
  imageSource?: string;
}) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const showApprovedImage = photo && imageSource && !imageUnavailable;

  return (
    <Card padding="none" interactive className="group flex flex-col">
      <div className="relative aspect-[2/1] overflow-hidden">
        <button
          type="button"
          onClick={() => onClick?.(lessonId)}
          aria-label={`Open lesson: ${title}`}
          className="absolute inset-0 size-full scroll-mb-24 text-left"
        >
          {showApprovedImage ? (
            <img
              src={imageSource}
              alt=""
              width={1800}
              height={1200}
              loading="lazy"
              decoding="async"
              onError={() => setImageUnavailable(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <LessonArt art={art} tone={tone} />
          )}
        </button>
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone="neutral" variant="solid" className="bg-white/95 text-navy-900">
            {level}
          </Badge>
        </div>
        <button
          type="button"
          aria-label={isBookmarked ? `Remove bookmark for ${title}` : `Bookmark ${title}`}
          aria-pressed={isBookmarked}
          onClick={() => onBookmark?.(lessonId)}
          className={cn(
            "absolute right-2 top-2 inline-flex size-11 scroll-mb-24 items-center justify-center rounded-full hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700",
            isBookmarked ? "bg-navy-900 text-white" : "bg-white/95 text-navy-900",
          )}
        >
          <Bookmark
            size={18}
            strokeWidth={1.75}
            fill={isBookmarked ? "currentColor" : "none"}
            aria-hidden
          />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onClick?.(lessonId)}
        aria-label={`Open lesson: ${title}`}
        className="flex flex-1 scroll-mb-24 flex-col p-4 text-left"
      >
        <p className="text-overline uppercase text-teal-700">{category}</p>
        {status && (
          <Badge
            tone={
              status === "Completed" ? "success" : status === "In progress" ? "teal" : "neutral"
            }
            size="sm"
            className="mt-2 w-fit"
          >
            {status}
          </Badge>
        )}
        <h3 className="mt-1 text-subheading text-ink">{title}</h3>
        {description && (
          <p className="mt-2 text-body-sm leading-5 text-ink-secondary">{description}</p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-4 text-caption text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={14} aria-hidden /> {minutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={14} aria-hidden /> +{points} pts
          </span>
        </div>
        {progress !== undefined && (
          <div className="mt-auto pt-4">
            <ProgressBar
              value={progress}
              size="sm"
              tone="teal"
              label={progress === 100 ? "Completed" : "In progress"}
              valueLabel={`${progress}%`}
            />
          </div>
        )}
      </button>
    </Card>
  );
}

/** Compact horizontal lesson row for lists and "up next". */
export function LessonRow({
  index,
  title,
  minutes,
  done,
  active,
}: {
  index: number;
  title: string;
  minutes: number;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2",
        active ? "bg-teal-50" : "hover:bg-sunken",
      )}
    >
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-body-sm font-semibold tabular-nums",
          done
            ? "bg-teal-600 text-white"
            : active
              ? "border-2 border-teal-600 text-teal-700"
              : "bg-sunken text-ink-muted",
        )}
      >
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-body-sm font-semibold",
            done ? "text-ink-muted" : "text-ink",
          )}
        >
          {title}
        </p>
        <p className="text-caption text-ink-muted">{minutes} min</p>
      </div>
      {active && <PlayCircle size={24} strokeWidth={1.75} className="text-teal-700" aria-hidden />}
    </div>
  );
}
