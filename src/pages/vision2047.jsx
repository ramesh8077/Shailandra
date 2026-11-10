import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useState } from "react";
import PageHero from "../components/PageHero";
import Blogs from "../components/Blogs";
export default function Vision2047Page() {
  const cms = useSection("vision2047");
  const questionImage = cms("f5");
  const accountabilityImage = cms("f4");
  const educationImage = cms("f3");
  const skillImage = cms("f2");
  const heroImage = cms("f1");
  const fourAsks = [{
    hindi: cms("f6"),
    english: cms("f7"),
    image: skillImage,
    text: cms("f8")
  }, {
    hindi: cms("f9"),
    english: cms("f10"),
    image: educationImage,
    text: cms("f11")
  }, {
    hindi: cms("f12"),
    english: cms("f13"),
    image: accountabilityImage,
    text: cms("f14")
  }, {
    hindi: cms("f15"),
    english: cms("f16"),
    image: questionImage,
    text: cms("f17")
  }];
  const faqs = [{
    question: cms("f18"),
    answer: cms("f41")
  }, {
    question: cms("f19"),
    answer: cms("f42")
  }, {
    question: cms("f20"),
    answer: cms("f43")
  }, {
    question: cms("f44"),
    answer: cms("f45")
  }, {
    question: cms("f46"),
    answer: cms("f47")
  }].filter(item => item.question && item.answer);
  const [openFaq, setOpenFaq] = useState(null);
  return <SectionBoundary name="vision2047"><>
      <PageHero title={cms("f25")} image={heroImage} position="center 35%" />

      {/* What India @100 Must Look Like */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f26")}</h2>
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f27")}</p>
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f28")}</p>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f29")}</p>
      </section>

      {/* The Four Asks */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-3 text-2xl font-bold text-[#ff6422]">{cms("f30")}</h2>
        <p className="mb-8 italic leading-relaxed text-gray-700">{cms("f31")}</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fourAsks.map(ask => <div key={ask.english} className="rounded-md bg-gray-50 p-5">
              <img src={ask.image} alt="" className="mb-4 aspect-[4/3] w-full rounded-lg object-cover" />
              <p className="text-lg font-bold text-[#ff6422]">{ask.hindi}</p>
              <p className="mb-3 text-xs font-semibold tracking-wide text-gray-800">{ask.english}</p>
              <p className="text-sm leading-relaxed text-gray-700">{ask.text}</p>
            </div>)}
        </div>
      </section>

      {/* Blogs & Articles */}
      <Blogs />

      {/* A Question, Answered */}
      {faqs.length > 0 && <section className="mx-auto max-w-6xl px-6 py-12">
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
      </section>}

      {/* Join the Conversation */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-8 rounded-md border border-gray-200 bg-gray-50 p-6 sm:p-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">Contact form</h2>
            <p className="leading-relaxed text-gray-700">{cms("f34")}</p>
          </div>
          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-800">{cms("f35")}<input type="text" placeholder={cms("f36")} className="mt-1 w-full border-b border-gray-300 pb-2 text-sm outline-none" />
            </label>
            <label className="text-sm font-semibold text-gray-800">{cms("f37")}<textarea placeholder={cms("f38")} rows={3} className="mt-1 w-full border-b border-gray-300 pb-2 text-sm outline-none" />
            </label>
            <button className="rounded-md bg-[#ff6422] px-5 py-3 text-sm font-bold text-white">{cms("f39")}</button>
          </form>
        </div>
      </section>

    </></SectionBoundary>;
}
