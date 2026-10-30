import { SectionBoundary } from "../cms/PublicCMS";
import { useSection, useJourney } from "../cms/contentContext";
import Photo from "../components/Photo";
import PageHero from "../components/PageHero";

// Page images

export default function JourneyPage() {
  const cms = useSection("JourneyPage");
  const BeliefFive = cms("f7");
  const BeliefFour = cms("f6");
  const BeliefThree = cms("f5");
  const BeliefTwo = cms("f4");
  const BeliefOne = cms("f3");
  const TimelineImg = cms("f2");
  const HeroImg = cms("f1");
  const timeline = useJourney();
  const beliefs = [{
    image: BeliefOne,
    label: cms("f8")
  }, {
    image: BeliefTwo,
    label: cms("f9")
  }, {
    image: BeliefThree,
    label: cms("f10")
  }, {
    image: BeliefFour,
    label: cms("f11")
  }, {
    image: BeliefFive,
    label: cms("f12")
  }];
  return <SectionBoundary name="JourneyPage"><main>
      {/* Journey Hero */}
      <PageHero title={cms("f13")} image={HeroImg} />

      {/* Story Section */}
      <section className="section-space">
        <div className="page-wrap grid gap-8 lg:grid-cols-2 lg:gap-12">
          <StoryBlock title={cms("f14")} className="text-orange-400">
            <p>{cms("f15")}</p>

            <p>{cms("f16")}</p>

            <p>{cms("f17")}</p>

            <p>{cms("f18")}</p>
          </StoryBlock>

          <StoryBlock title={cms("f19")}>
            <p>{cms("f20")}</p>

            <p>{cms("f21")}</p>

            <p>{cms("f22")}</p>

            <p>{cms("f23")}</p>

            <p className="font-bold italic text-[#10283d]">{cms("f24")}</p>
          </StoryBlock>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-space bg-[#f2f8fc]">
        <div className="page-wrap">
          <h2 className="journey-heading mb-14 text-center text-orange-400">{cms("f25")}</h2>

          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <div className="relative space-y-8 pl-10 sm:pl-16">
              <div className="absolute bottom-3 left-[11px] top-3 w-px bg-[#d4e0ea] sm:left-[23px]" />

              {timeline.map((item, index) => <article key={item.year} className="relative">
                  <span className={`absolute -left-[35px] top-2 h-3 w-3 rounded-full border-2 sm:-left-[47px] ${index === 1 ? "border-[#ff6422] bg-[#ff6422] ring-4 ring-orange-100" : "border-[#9aacc0] bg-white"}`} />

                  <h3 className={`text-3xl font-extrabold leading-none ${index === 0 ? "text-[#ff6422]" : "text-slate-500"}`}>
                    {item.year}
                  </h3>

                  <p className="mb-2 mt-2 font-semibold text-[#10283d]">
                    {item.title}
                  </p>

                  <p className="max-w-xl text-base leading-6 text-slate-500">
                    {item.text}
                  </p>
                </article>)}
            </div>

            <Photo src={TimelineImg} className="h-[min(78vw,480px)] min-h-[300px] w-full rounded-3xl bg-cover bg-center shadow-lg lg:h-[480px]" />
          </div>
        </div>
      </section>

      {/* Beliefs Section */}
      <section className="section-space">
        <div className="page-wrap">
          <h2 className="journey-heading text-center text-orange-400">{cms("f26")}</h2>

          <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {beliefs.map(belief => <article key={belief.label} className="min-w-[210px] snap-center rounded-2xl bg-[#fbfbfc] p-4 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-lg lg:min-w-0">
                <Photo src={belief.image} className="mx-auto h-40 w-full rounded-xl bg-cover bg-center" />

                <p className="mx-auto mt-4 max-w-[170px] text-sm leading-5 text-slate-700">
                  {belief.label}
                </p>
              </article>)}
          </div>

          {/* Ethos Section */}
          <div className="my-12 rounded-2xl border border-slate-300 bg-[#f5f9fc] p-6 sm:p-8">
            <h2 className="journey-heading mb-4 text-orange-400">{cms("f27")}</h2>

            <p className="leading-7 text-slate-700">{cms("f28")}</p>
          </div>

          {/* Family and Recognition */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <StoryBlock title={cms("f29")}>
              <p>{cms("f30")}</p>
            </StoryBlock>

            <StoryBlock title={cms("f31")}>
              <p>{cms("f32")}</p>
            </StoryBlock>
          </div>
        </div>
      </section>
    </main></SectionBoundary>;
}
function StoryBlock({
  title,
  children
}) {
  return <article>
      <h2 className="journey-heading mb-6 text-orange-400">{title}</h2>

      <div className="whitespace-pre-line space-y-5 text-base leading-7 text-slate-700">
        {children}
      </div>
    </article>;
}
