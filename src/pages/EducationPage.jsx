import { SectionBoundary } from "../cms/PublicCMS";
import { PostList } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
export default function EducationPage() {
  const cms = useSection("EducationPage");
  const policyImage = cms("f2");
  const heroImage = cms("f1");
  const faqs = [{
    question: cms("f7"),
    answer: cms("f45")
  }, {
    question: cms("f8"),
    answer: cms("f46")
  }, {
    question: cms("f9"),
    answer: cms("f47")
  }, {
    question: cms("f41"),
    answer: cms("f42")
  }, {
    question: cms("f43"),
    answer: cms("f44")
  }].filter(item => item.question && item.answer);
  const [openFaq, setOpenFaq] = useState(null);
  return <SectionBoundary name="EducationPage"><>
      {/* Hero banner */}
      <PageHero title={cms("f14")} image={heroImage} position="center 38%" />

      {/* Institutional Record */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 items-start">
        <div>
          {/* <img src={campreplac} alt="Pratap University campus" className="aspect-[4/5] w-full rounded-xl object-cover shadow-sm" /> */}
          <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-6">
            <span className="text-3xl text-[#ff6422]">&ldquo;</span>
            <p className="italic leading-relaxed text-gray-700">{cms("f15")}</p>
            <span className="block text-right text-3xl text-[#ff6422]">&rdquo;</span>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f16")}</h2>
          <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f17")}</p>
          <p className="mb-6 whitespace-pre-line leading-relaxed text-gray-700">{cms("f18")}</p>
          <p className="mb-3 text-sm text-gray-500">{cms("f19")}</p>
          <div className="flex flex-wrap gap-4">
            <Link to={cms("f20")} className="rounded-md bg-[#ff6422] px-5 py-3 text-sm font-bold text-white">{cms("f21")}</Link>
            <Link to={cms("f22")} className="rounded-md border border-gray-300 px-5 py-3 text-sm font-bold text-gray-800">{cms("f23")}</Link>
          </div>
        </div>
      </section>

      {/* My Education Philosophy */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f24")}</h2>
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f25")}</p>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f26")}</p>
      </section>

      {/* Understanding the System */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f27")}</h2>
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f28")}</p>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f29")}</p>
      </section>

      {/* What Changed, For Whom */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f30")}</h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f31")}</p>
          </div>
          <img src={policyImage} alt={cms("f32")} className="aspect-video w-full rounded-xl object-cover shadow-sm" />
        </div>
      </section>
{/* FAQs */}
{faqs.length > 0 && <section className="mx-auto max-w-6xl px-6 py-16">
  <h2 className="mb-6 text-2xl font-bold text-[#ff6422]">{cms("f33")}</h2>

  <div className="space-y-3">
    {faqs.map((item, i) => <div key={i} className="overflow-hidden rounded-md border border-gray-200">
        <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50">
          <span>{item.question}</span>

          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gray-300 text-lg text-gray-500">
            {openFaq === i ? "−" : "+"}
          </span>
        </button>

        {openFaq === i && <div className="border-t border-gray-200 px-5 py-4 text-sm leading-relaxed text-gray-600">
            {item.answer}
          </div>}
      </div>)}
  </div>
</section>}

      {/* Join the Conversation */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 rounded-md border border-gray-200 bg-white p-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f34")}</h2>
            <p className="leading-relaxed text-gray-700">{cms("f35")}</p>
          </div>
          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-800">{cms("f36")}<input type="text" placeholder={cms("f37")} className="mt-1 w-full border-b border-gray-300 pb-2 text-sm outline-none" />
            </label>
            <label className="text-sm font-semibold text-gray-800">{cms("f38")}<textarea placeholder={cms("f39")} rows={3} className="mt-1 w-full border-b border-gray-300 pb-2 text-sm outline-none" />
            </label>
            <button className="rounded-md bg-[#ff6422] px-5 py-3 text-sm font-bold text-white">{cms("f40")}</button>
          </form>
        </div>
      </section>

      {/* Related Reading */}
      <PostList title="My Thoughts on the Future of Education" type="article" category="Education" />
    </></SectionBoundary>;
}
