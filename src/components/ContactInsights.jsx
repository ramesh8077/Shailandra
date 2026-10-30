import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useEffect, useRef, useState } from "react";
import { FaYoutube } from "react-icons/fa6";

export default function ContactInsights() {
  const cms = useSection("ContactInsights");

  // First two come from the CMS. Add more by pasting the YouTube video ID
  // (the part after v= in the URL) and a title.
  const insights = [
    { id: 1, videoId: cms("f1"), title: cms("f2") },
    { id: 2, videoId: cms("f3"), title: cms("f4") },
    { id: 3, videoId: cms ("f29"), title: cms("f29") },
    { id: 4, videoId: cms("f30"), title: cms("f30") },
    { id: 5, videoId: cms("f31"), title: cms("f32") },
    { id: 7, videoId: cms("f34"), title: cms("f34") },
  ].filter((v) => v.videoId && !v.videoId.startsWith("YOUTUBE_VIDEO_ID"));

  const [activeVideo, setActiveVideo] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeVideo && !dialog.open) {
      dialog.showModal();
    } else if (!activeVideo && dialog.open) {
      dialog.close();
    }
  }, [activeVideo]);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <SectionBoundary name="ContactInsights">
      <section id="contact" className="bg-[#f1f8fc] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto grid w-[calc(100%-32px)] max-w-[1180px] items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Left Form */}
          <div>
            <h2 className="mb-6 text-2xl font-extrabold text-[#10283d] sm:text-3xl">{cms("f5")}</h2>

            <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
              <label className="field">
                {cms("f6")}
                <input type="text" required placeholder={cms("f7")} />
              </label>

              <label className="field">
                {cms("f8")}
                <select required defaultValue="">
                  <option value="" disabled>{cms("f9")}</option>
                  <option value="under-18">{cms("f10")}</option>
                  <option value="18-25">{cms("f11")}</option>
                  <option value="26-40">{cms("f12")}</option>
                  <option value="40-plus">{cms("f13")}</option>
                </select>
              </label>

              <label className="field sm:col-span-2">
                {cms("f14")}
                <input type="text" required placeholder={cms("f15")} />
              </label>

              <label className="field sm:col-span-2">
                {cms("f16")}
                <select required defaultValue="">
                  <option value="" disabled>{cms("f17")}</option>
                  <option value="education">{cms("f18")}</option>
                  <option value="sports">{cms("f19")}</option>
                  <option value="public-service">{cms("f20")}</option>
                  <option value="other">{cms("f21")}</option>
                </select>
              </label>

              <label className="field sm:col-span-2">
                {cms("f22")}
                <textarea required rows="3" placeholder={cms("f23")} />
              </label>

              <button
                type="submit"
                className="rounded-md bg-[#ff6422] px-6 py-4 font-extrabold text-white transition hover:bg-[#e95014] sm:col-span-2"
              >
                {cms("f24")}
              </button>
            </form>
          </div>

          {/* Right Insights */}
          <div className="w-full max-w-[440px] lg:justify-self-end">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-[#10283d] sm:text-3xl">{cms("f25")}</h2>
                <p className="mt-1 text-sm text-slate-500">{cms("f26")}</p>
              </div>
              <a
                href={cms("f27")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
              >
                <FaYoutube aria-hidden="true" className="text-lg" />
                {cms("f28")}
              </a>
            </div>

            {/* Scrollable video list */}
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2 lg:max-h-[420px] [scrollbar-width:thin] [scrollbar-color:#ff6422_transparent]">
              {insights.map((insight) => (
                <button
                  type="button"
                  key={insight.id}
                  onClick={() => setActiveVideo(insight)}
                  aria-label={`Play video: ${insight.title}`}
                  className="group relative block aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-[#5f2d23] text-left shadow-md"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${insight.videoId}/hqdefault.jpg`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/40" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-black/35 pl-1 text-lg text-white backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-[#ff6422]">
                      ▶
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <dialog
          ref={dialogRef}
          aria-label={activeVideo?.title ?? "YouTube video"}
          onCancel={(event) => {
            event.preventDefault();
            setActiveVideo(null);
          }}
          onClose={() => setActiveVideo(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActiveVideo(null);
            }
          }}
          className="w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-2xl border-0 bg-[#10283d] p-0 text-white shadow-2xl backdrop:bg-black/80"
        >
          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <h2 className="font-bold">{activeVideo?.title}</h2>
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-2xl transition hover:bg-white/20"
            >
              ×
            </button>
          </div>
          {activeVideo && (
            <div className="aspect-video w-full bg-black">
              <iframe
                key={activeVideo.videoId}
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          )}
        </dialog>
      </section>
    </SectionBoundary>
  );
}
