'use client';

import { useEffect, useMemo, useState } from "react";

type PlanBeat = {
  id: string;
  hook: string;
  narration: string;
  visualPrompt: string;
  durationSeconds: number;
};

type PlanResponse = {
  title: string;
  description: string;
  tags: string[];
  beats: PlanBeat[];
};

type PipelineLog = {
  step: string;
  message: string;
  timestamp: string;
};

type ApiResponse =
  | {
      success: true;
      plan: PlanResponse;
      videoBase64: string;
      thumbnailBase64: string;
      totalDuration: number;
      youtubeUrl: string | null;
      youtubeId: string | null;
      logs: PipelineLog[];
    }
  | {
      success: false;
      error: string;
    };

const base64ToBlob = (base64: string, mimeType: string) => {
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    buffer[i] = binary.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeType });
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("energetic");
  const [targetAudience, setTargetAudience] = useState("Creators & builders");
  const [cta, setCta] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(45);
  const [uploadToYoutube, setUploadToYoutube] = useState(true);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customTags, setCustomTags] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [logs, setLogs] = useState<PipelineLog[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [videoUrl, thumbnailUrl]);

  const tagList = useMemo(() => {
    if (!plan) {
      return [];
    }
    return Array.from(new Set(plan.tags)).filter(Boolean);
  }, [plan]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setLogs([]);
    setPlan(null);
    setYoutubeUrl(null);

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
      setThumbnailUrl(null);
    }

    try {
      const payload = {
        topic,
        tone,
        targetAudience,
        cta: cta || undefined,
        durationSeconds,
        uploadToYoutube,
        customTitle: customTitle || undefined,
        customDescription: customDescription || undefined,
        customTags:
          customTags.length > 0
            ? customTags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : undefined,
      };

      const response = await fetch("/api/create-short", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ApiResponse;

      if (!data.success) {
        throw new Error(data.error ?? "Pipeline failed");
      }

      const videoBlob = base64ToBlob(data.videoBase64, "video/mp4");
      const thumbBlob = base64ToBlob(data.thumbnailBase64, "image/jpeg");

      const videoObjectUrl = URL.createObjectURL(videoBlob);
      const thumbObjectUrl = URL.createObjectURL(thumbBlob);

      setPlan(data.plan);
      setLogs(data.logs);
      setVideoUrl(videoObjectUrl);
      setThumbnailUrl(thumbObjectUrl);
      setYoutubeUrl(data.youtubeUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row">
        <section className="w-full rounded-3xl bg-zinc-900/70 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur">
          <header className="mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Agentic Studio
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              AI Shorts Maker & YouTube Autopilot
            </h1>
            <p className="text-zinc-400">
              Describe the story you want to tell. We&apos;ll generate the script, visuals, narration,
              assemble a vertical short, and push it live to your YouTube channel.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="topic">
                Video topic
              </label>
              <input
                id="topic"
                type="text"
                required
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="How to automate your morning routine with AI"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-base outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="tone">
                  Tone
                </label>
                <input
                  id="tone"
                  type="text"
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  placeholder="Energetic, upbeat, optimistic"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-base outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="audience">
                  Target audience
                </label>
                <input
                  id="audience"
                  type="text"
                  value={targetAudience}
                  onChange={(event) => setTargetAudience(event.target.value)}
                  placeholder="Busy founders, indie hackers, productivity lovers"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-base outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="cta">
                Optional call-to-action
              </label>
              <input
                id="cta"
                type="text"
                value={cta}
                onChange={(event) => setCta(event.target.value)}
                placeholder="Download the free automation checklist"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-base outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-medium text-zinc-300">
                Target duration: {durationSeconds}s
              </label>
              <input
                type="range"
                min={20}
                max={120}
                value={durationSeconds}
                onChange={(event) => setDurationSeconds(Number(event.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="customTitle">
                  Override title (optional)
                </label>
                <input
                  id="customTitle"
                  type="text"
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder="The AI Routine That Saves 2 Hours Every Morning"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-base outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="customTags">
                  Override tags (comma separated)
                </label>
                <input
                  id="customTags"
                  type="text"
                  value={customTags}
                  onChange={(event) => setCustomTags(event.target.value)}
                  placeholder="ai,automation,morning routine"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-base outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="description">
                Override description (optional)
              </label>
              <textarea
                id="description"
                value={customDescription}
                onChange={(event) => setCustomDescription(event.target.value)}
                rows={4}
                placeholder="Drop your own SEO-optimized description here..."
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-base outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              />
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-zinc-300">
              <input
                type="checkbox"
                checked={uploadToYoutube}
                onChange={(event) => setUploadToYoutube(event.target.checked)}
                className="h-4 w-4 rounded border border-white/20 bg-zinc-900 text-emerald-400 focus:ring-emerald-400"
              />
              Auto-upload to YouTube
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-6 py-4 text-base font-semibold text-emerald-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-800"
            >
              {isSubmitting ? "Producing your short..." : "Generate & Upload"}
            </button>

            {errorMessage ? (
              <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            ) : null}
          </form>
        </section>

        <aside className="flex min-h-[480px] w-full flex-col gap-6 rounded-3xl bg-zinc-900/40 p-6 ring-1 ring-white/5 backdrop-blur lg:w-[380px]">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Pipeline log</h2>
            <div className="grid gap-2 text-sm text-zinc-400">
              {logs.length === 0 ? (
                <p className="rounded-lg border border-white/5 bg-zinc-900/40 px-3 py-3 text-xs text-zinc-500">
                  Status updates will appear here while we build your short.
                </p>
              ) : (
                logs.map((entry) => (
                  <div
                    key={`${entry.step}-${entry.timestamp}`}
                    className="rounded-xl border border-white/5 bg-zinc-900/60 px-3 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                      {entry.step}
                    </p>
                    <p>{entry.message}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {plan ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4">
                <h3 className="text-base font-semibold text-white">
                  {customTitle || plan.title}
                </h3>
                <p className="mt-2 max-h-32 overflow-y-auto pr-1 text-sm text-zinc-400">
                  {plan.description}
                </p>
                {tagList.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagList.slice(0, 8).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Story beats
                </h3>
                <div className="space-y-3">
                  {plan.beats.map((beat) => (
                    <div
                      key={beat.id}
                      className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">
                        {beat.hook}
                      </p>
                      <p className="mt-2 text-sm text-white">{beat.narration}</p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Visual prompt: {beat.visualPrompt}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Duration: {beat.durationSeconds}s
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {videoUrl ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Preview
              </h3>
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  playsInline
                  className="h-[420px] w-full bg-black object-cover"
                />
              </div>
              <div className="flex gap-3">
                <a
                  href={videoUrl}
                  download="ai-short.mp4"
                  className="flex-1 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-center text-sm font-medium text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-400/20"
                >
                  Download MP4
                </a>
                {thumbnailUrl ? (
                  <a
                    href={thumbnailUrl}
                    download="thumbnail.jpg"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Download Thumbnail
                  </a>
                ) : null}
              </div>
              {youtubeUrl ? (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                  View on YouTube
                </a>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
