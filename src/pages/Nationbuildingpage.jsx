import { SectionBoundary } from "../cms/PublicCMS";
import { PostList } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useState } from "react";
import PageHero from "../components/PageHero";
import Blogs from "../components/Blogs";
export default function NationBuildingPage() {
  const cms = useSection("Nationbuildingpage");
  const viksitBharatImage = cms("f2");
  const policyMeetsPeopleImage = cms("f1");
  const coffeePeCharchaVideos = [{
    title: "Success isn’t just about how much you earn.",
    videoId: "hwM3ahuLfx0"
  }, {
    title: "2047 ही क्यों? 2040 क्यों नहीं?",
    videoId: "66B3SkxGOwo"
  }, {
    title: "विकसित भारत 2047 आख़िर है क्या?",
    videoId: "txFvX39Yg2E"
  }];

  // All 8 posts share the same placeholder copy for now swap in real posts
  // (and their own screenshot images) once you have them.

  const faqs = [{
    question: cms("f11"),
    answer: cms("f41")
  }, {
    question: cms("f12"),
    answer: cms("f42")
  }, {
    question: cms("f13"),
    answer: cms("f43")
  }, {
    question: cms("f37"),
    answer: cms("f38")
  }, {
    question: cms("f39"),
    answer: cms("f40")
  }].filter(item => item.question && item.answer);
  const [openFaq, setOpenFaq] = useState(null);
  return <SectionBoundary name="Nationbuildingpage"><>
      <PageHero title={cms("f18")} image={policyMeetsPeopleImage} />

      {/* Where Policy Meets People */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f19")}</h2>
            <p className="whitespace-pre-line border-l-4 border-[#ff6422] pl-5 leading-relaxed text-gray-700">{cms("f20")}</p>
          </div>
          <div>
            <img src={policyMeetsPeopleImage} alt={cms("f21")} className="block h-auto w-full rounded-md object-contain" />
          </div>
        </div>
      </section>

      {/* Viksit Bharat 2047  The Bigger Picture */}
      {faqs.length > 0 && <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <img src={viksitBharatImage} alt={cms("f22")} className="block h-auto w-full rounded-md object-contain" />
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f23")}</h2>
            <div className="border-l-4 border-[#ff6422] pl-5">
              <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f24")}</p>
              <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f25")}</p>
            </div>
          </div>
        </div>
      </section>}

      {/* Coffee Pe Charcha video series */}
      <section className="bg-[#f3f8fb] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-extrabold tracking-[0.2em] text-[#f05d25]">YouTube series</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#10283d] sm:text-4xl">Coffee Pe Charcha</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-right">Conversations on nation building, India's future, and the questions that matter.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {coffeePeCharchaVideos.map(video => <article key={video.videoId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-video bg-black">
                  <iframe src={`https://www.youtube-nocookie.com/embed/${video.videoId}`} title={video.title} loading="lazy" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                </div>
                <h3 className="min-h-20 p-5 font-bold leading-snug text-[#10283d]">{video.title}</h3>
              </article>)}
          </div>
        </div>
      </section>

      {/* In the Room */}
      <PostList title="In the room" type="news" />

      {/* Blogs & Articles */}
      <Blogs />

      {/* A Question, Answered */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-6 text-2xl font-bold text-[#ff6422]">FAQs</h2>
        <div className="space-y-3">
          {faqs.map((item, i) => <article key={i} className="overflow-hidden rounded-md border border-gray-200">
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-800">
                <span>{item.question}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gray-300 text-gray-500">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && <p className="whitespace-pre-line border-t border-gray-200 px-5 py-4 text-sm leading-relaxed text-gray-600">{item.answer}</p>}
            </article>)}
        </div>
      </section>

      {/* Join the Conversation */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-8 rounded-md border border-gray-200 bg-gray-50 p-6 sm:p-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">Contact form</h2>
            <p className="leading-relaxed text-gray-700">{cms("f31")}</p>
          </div>
          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-800">{cms("f32")}<input type="text" placeholder={cms("f33")} className="mt-1 w-full border-b border-gray-300 pb-2 text-sm outline-none" />
            </label>
            <label className="text-sm font-semibold text-gray-800">{cms("f34")}<textarea placeholder={cms("f35")} rows={3} className="mt-1 w-full border-b border-gray-300 pb-2 text-sm outline-none" />
            </label>
            <button className="rounded-md bg-[#ff6422] px-5 py-3 text-sm font-bold text-white">{cms("f36")}</button>
          </form>
        </div>
      </section>

    </></SectionBoundary>;
}
