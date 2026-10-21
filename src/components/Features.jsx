import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useRef } from "react";

// Media logos

export default function Features() {
  const cms = useSection("Features");
  const PublicPolicyImg = cms("f7");
  const VisionYouthImg = cms("f6");
  const TimesNowLogo = cms("f5");
  const AajTakLogo = cms("f4");
  const IndiaTodayLogo = cms("f3");
  const NdtvLogo = cms("f2");
  const ZeeNewsLogo = cms("f1");
  const media = [{
    name: cms("f8"),
    image: ZeeNewsLogo
  }, {
    name: cms("f9"),
    image: NdtvLogo
  }, {
    name: cms("f10"),
    image: IndiaTodayLogo
  }, {
    name: cms("f11"),
    image: AajTakLogo
  }, {
    name: cms("f12"),
    image: TimesNowLogo
  }];
  const features = [{
    title: cms("f13"),
    image: VisionYouthImg,
    paragraphs: [cms("f14"), cms("f15"), cms("f16")]
  }, {
    title: cms("f17"),
    image: PublicPolicyImg,
    paragraphs: [cms("f18")],
    link: true
  }];
  const mediaRef = useRef(null);
  const scrollMedia = direction => {
    mediaRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth"
    });
  };
  return <SectionBoundary name="Features"><section id="features" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="page-wrap">
        {/* Heading */}
        <h2 className="mb-10 text-center text-2xl font-extrabold text-[#10283d] sm:text-3xl">{cms("f19")}</h2>

        {/* Media logos */}
        <div className="relative mx-auto mb-14 flex max-w-fit items-center gap-3 sm:gap-5">
          <button type="button" onClick={() => scrollMedia("left")} aria-label="Previous media logos" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-lg font-bold text-[#17364d] shadow-md transition hover:bg-[#ff6422] hover:text-white">
            ←
          </button>

          <div ref={mediaRef} className="flex flex-1 gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
            {media.map(item => <div key={item.name} className="grid h-[90px] min-w-[145px] place-items-center rounded-xl border border-slate-100 bg-white px-5 shadow-[0_5px_20px_rgba(15,39,59,0.08)] sm:h-[95px] sm:min-w-[155px]">
                <img src={item.image} alt={item.name} className="max-h-16 w-auto max-w-[140px] object-contain" />
              </div>)}
          </div>

          <button type="button" onClick={() => scrollMedia("right")} aria-label="Next media logos" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-lg font-bold text-[#17364d] shadow-md transition hover:bg-[#ff6422] hover:text-white">
            →
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {features.map(feature => <article key={feature.title} className="group grid overflow-hidden rounded-2xl bg-[#f8f9fb] shadow-[0_8px_30px_rgba(15,39,59,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(15,39,59,0.12)] sm:grid-cols-[190px_1fr]">
              {/* Feature image */}
              <div className="overflow-hidden sm:h-full sm:min-h-[290px]">
  <img src={feature.image} alt={feature.title} className="
      block h-auto w-full
      transition duration-500
      sm:h-full sm:object-cover sm:object-center
      sm:group-hover:scale-105
    " />
</div>

              {/* Feature content */}
              <div className="flex flex-col p-6 sm:p-7">
                <h3 className="mb-4 text-xl font-extrabold leading-snug text-[#10283d]">
                  {feature.title}
                </h3>

                <div className="space-y-4">
                  {feature.paragraphs.map((paragraph, index) => <p key={index} className="text-sm italic leading-6 text-slate-500">
                      {paragraph}
                    </p>)}
                </div>

                {feature.link && <a href="#youth-connect" className="mt-auto inline-flex border-b border-slate-300 pt-5 text-sm font-extrabold text-[#ff6422] transition hover:text-[#df4e13]">
                    Get to know more.
                  </a>}
              </div>
            </article>)}
        </div>
      </div>
    </section></SectionBoundary>;
}
