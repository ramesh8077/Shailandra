import { SectionBoundary } from "../cms/PublicCMS";
import { sentenceCase, useSection } from "../cms/contentContext";
import { useState } from "react";
import PageHero from "../components/PageHero";
export default function UpDevelopmentPage() {
  const cms = useSection("Updevelopmentpage");
  const medical1 = cms("f1");
  const caseStudies = [{
    title: cms("f5"),
    slides: [{
      text: cms("f6"),
      source: null,
      sourceUrl: null
    }, {
      text: cms("f9"),
      source: null,
      sourceUrl: null
    }, {
      text: cms("f10"),
      source: null,
      sourceUrl: null
    }]
  }, {
    title: cms("f12"),
    slides: [{
      text: cms("f13"),
      source: null,
      sourceUrl: null
    }]
  }, {
    title: cms("f14"),
    slides: [{
      text: cms("f15"),
      source: null,
      sourceUrl: null
    }]
  }, {
    title: cms("f16"),
    slides: [{
      text: cms("f17"),
      source: null,
      sourceUrl: null
    }]
  }];
  const [activeCategory, setActiveCategory] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const category = caseStudies[activeCategory];
  const slide = category.slides[slideIndex];
  function selectCategory(index) {
    setActiveCategory(index);
    setSlideIndex(0);
  }
  function goPrev() {
    setSlideIndex(i => Math.max(0, i - 1));
  }
  function goNext() {
    setSlideIndex(i => Math.min(category.slides.length - 1, i + 1));
  }
  return <SectionBoundary name="Updevelopmentpage"><>
      <PageHero title={cms("f25")} image={medical1} />

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f26")}</h2>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f27")}</p>
      </section>

      {/* Case study browser */}
      {caseStudies.length > 0 && <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,260px)_1fr]">
          {/* Category list */}
          <div className="flex flex-col gap-2">
            {caseStudies.map((item, i) => <button key={item.title} type="button" onClick={() => selectCategory(i)} className={`border-l-4 px-4 py-4 text-left text-sm font-semibold transition ${activeCategory === i ? "border-[#ff6422] bg-orange-50 text-gray-900" : "border-gray-200 text-gray-600 hover:border-[#ff6422] hover:bg-orange-50"}`}>
                {item.title}
              </button>)}
          </div>

          {/* Content panel */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-[#ff6422]">{sentenceCase(category.title)}</h3>

            {activeCategory === 0 && <img src={medical1} alt={cms("f28")} className="mb-6 h-auto w-full rounded-md object-contain" />}

            <p className="whitespace-pre-line leading-relaxed text-gray-700">
              {slide.text}
              {slide.source && <>
                  {" "}
                  <a href={slide.sourceUrl} className="text-blue-600 underline">
                    {slide.source}
                  </a>
                </>}
            </p>

            <div className="mt-8 flex items-center justify-between text-sm font-bold">
              <button type="button" onClick={goPrev} disabled={slideIndex === 0} className="flex items-center gap-1 text-[#ff6422] disabled:text-gray-300">
                <span aria-hidden="true">‹</span>{cms("f29")}</button>
              <span className="text-[#ff6422]">
                {slideIndex + 1}/{category.slides.length}
              </span>
              <button type="button" onClick={goNext} disabled={slideIndex === category.slides.length - 1} className="flex items-center gap-1 text-[#ff6422] disabled:text-gray-300">{cms("f30")}<span aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        </div>
      </section>}

    </></SectionBoundary>;
}
