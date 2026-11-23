import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaYoutube } from "react-icons/fa6";
import { API_BASE } from "../cms/api";

export default function ContactInsights() {
  const cms = useSection("ContactInsights");

  const insights = [
    { id: 1, videoId: cms("f1"), title: cms("f2") },
    { id: 2, videoId: cms("f3"), title: cms("f4") },
    { id: 3, videoId: cms("f29"), title: cms("f29") },
    { id: 4, videoId: cms("f30"), title: cms("f30") },
    { id: 5, videoId: cms("f31"), title: cms("f32") },
    { id: 7, videoId: cms("f34"), title: cms("f34") },
  ].filter((v) => v.videoId && !v.videoId.startsWith("YOUTUBE_VIDEO_ID"));
  const insightPages = [];
  for (let index = 0; index < insights.length; index += 2) {
    const page = insights.slice(index, index + 2);
    if (page.length === 1 && index > 0) page.unshift(insights[index - 1]);
    insightPages.push(page);
  }

  const [activeVideo, setActiveVideo] = useState(null);
  const dialogRef = useRef(null);
  const contactColumnRef = useRef(null);
  const [contactColumnHeight, setContactColumnHeight] = useState(null);

  useLayoutEffect(() => {
    const column = contactColumnRef.current;
    if (!column) return undefined;
    const updateHeight = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      setContactColumnHeight(isDesktop ? Math.ceil(column.getBoundingClientRect().height) : null);
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(column);
    window.addEventListener('resize', updateHeight);
    updateHeight();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '', ageGroup: '', location: '', interest: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { type: 'success' | 'error', text }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeVideo && !dialog.open) {
      dialog.showModal();
    } else if (!activeVideo && dialog.open) {
      dialog.close();
    }
  }, [activeVideo]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setSubmitResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const response = await fetch(`${API_BASE}/api/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitResult({ type: 'success', text: data.message || 'Message sent successfully!' });
        setFormData({ name: '', ageGroup: '', location: '', interest: '', message: '' });
      } else {
        setSubmitResult({ type: 'error', text: data.error?.message || 'Failed to send. Please try again.' });
      }
    } catch {
      setSubmitResult({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionBoundary name="ContactInsights">
      <section id="contact" className="bg-[#f1f8fc] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto grid w-[calc(100%-32px)] max-w-[1180px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Left Form */}
          <div ref={contactColumnRef}>
            <h2 className="mb-6 text-2xl font-extrabold text-[#10283d] sm:text-3xl">Contact form</h2>

            {submitResult && (
              <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-semibold ${
                submitResult.type === 'success'
                  ? 'border border-green-200 bg-green-50 text-green-800'
                  : 'border border-red-200 bg-red-50 text-red-800'
              }`} role={submitResult.type === 'success' ? 'status' : 'alert'}>
                {submitResult.text}
              </div>
            )}

            <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
              <label className="field">
                {cms("f6")}
                <input type="text" required placeholder={cms("f7")} value={formData.name} onChange={handleChange('name')} />
              </label>

              <label className="field">
                {cms("f8")}
                <select required value={formData.ageGroup} onChange={handleChange('ageGroup')}>
                  <option value="" disabled>{cms("f9")}</option>
                  <option value="under-18">{cms("f10")}</option>
                  <option value="18-25">{cms("f11")}</option>
                  <option value="26-40">{cms("f12")}</option>
                  <option value="40-plus">{cms("f13")}</option>
                </select>
              </label>

              <label className="field sm:col-span-2">
                {cms("f14")}
                <input type="text" required placeholder={cms("f15")} value={formData.location} onChange={handleChange('location')} />
              </label>

              <label className="field sm:col-span-2">
                {cms("f16")}
                <select required value={formData.interest} onChange={handleChange('interest')}>
                  <option value="" disabled>{cms("f17")}</option>
                  <option value="education">{cms("f18")}</option>
                  <option value="sports">{cms("f19")}</option>
                  <option value="public-service">{cms("f20")}</option>
                  <option value="other">{cms("f21")}</option>
                </select>
              </label>

              <label className="field sm:col-span-2">
                {cms("f22")}
                <textarea required rows="3" placeholder={cms("f23")} value={formData.message} onChange={handleChange('message')} />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-[#ff6422] px-6 py-4 font-extrabold text-white transition hover:bg-[#e95014] disabled:opacity-50 sm:col-span-2"
              >
                {submitting ? 'Sending...' : cms("f24")}
              </button>
            </form>
          </div>

          {/* Right Insights */}
          <div style={contactColumnHeight ? { height: `${contactColumnHeight}px` } : undefined} className="flex w-full max-w-[440px] flex-col overflow-hidden lg:min-h-0 lg:justify-self-end">
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
            <div role="region" aria-label="Latest insights videos" className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain snap-y snap-mandatory [scrollbar-width:thin] [scrollbar-color:#ff6422_transparent]">
              {insightPages.map((page) => (
                <div key={page[0].id} className="flex flex-col gap-2 lg:h-full lg:min-h-full lg:shrink-0 lg:snap-start lg:py-1">
                  {page.map((insight) => (
                    <button
                      type="button"
                      key={insight.id}
                      onClick={() => setActiveVideo(insight)}
                      aria-label={`Play video: ${insight.title}`}
                      className="group relative mx-auto block aspect-video w-full overflow-hidden rounded-xl bg-[#5f2d23] text-left shadow-md lg:aspect-auto lg:min-h-0 lg:flex-1 lg:max-w-[440px]"
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
