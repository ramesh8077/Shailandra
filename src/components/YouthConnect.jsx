import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useState } from "react";
export default function YouthConnect() {
  const cms = useSection("YouthConnect");
  const YouthImg = cms("f1");
  const questions = [{
    q: cms("f2"),
    a: cms("f3")
  }, {
    q: cms("f4"),
    a: cms("f5")
  }, {
    q: cms("f6"),
    a: cms("f7")
  }, {
    q: cms("f8"),
    a: cms("f9")
  }, {
    q: cms("f10"),
    a: cms("f11")
  }];
  const [active, setActive] = useState(2);
  const handleQuestion = index => {
    setActive(active === index ? -1 : index);
  };
  return <SectionBoundary name="YouthConnect"><section id="youth-connect" className="bg-white py-12 sm:py-14 lg:py-16">
      <div className="page-wrap">
        {/* Section heading */}
        <h2 className="text-center text-2xl font-extrabold text-[#10283d] sm:text-3xl">{cms("f12")}</h2>

        {/* Introduction */}
        <div className="mx-auto mt-8 grid max-w-5xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          {/* Left text */}
          <div>
            <p className="text-[15px] leading-6 text-[#10283d] sm:text-base sm:leading-7">
              <strong className="font-extrabold">{cms("f13")}</strong>{" "}{cms("f14")}</p>

            <p className="mt-1 text-[15px] leading-6 text-[#10283d] sm:text-base sm:leading-7">{cms("f15")}</p>
          </div>

          {/* Right image */}
          <div className="flex min-h-[240px] items-center justify-center sm:min-h-[300px] lg:justify-end">
            <img src={YouthImg} alt={cms("f16")} className="h-auto max-h-[320px] w-full max-w-[570px] object-contain object-center" />
          </div>
        </div>

        {/* Questions accordion */}
        <div className="mx-auto mt-10 max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white">
          {questions.map((item, index) => {
            const isActive = active === index;
            return <article key={item.q} className={`border-b border-slate-200 last:border-b-0 ${isActive ? "bg-[#fff1eb]" : "bg-white"}`}>
                <button type="button" onClick={() => handleQuestion(index)} className={`flex w-full items-start justify-between gap-5 px-5 py-5 text-left text-sm font-bold transition-colors sm:px-7 sm:text-[15px] ${isActive ? "text-[#f05d25]" : "text-[#10283d] hover:text-[#f05d25]"}`}>
                  <span>
                    <span className="mr-1 font-extrabold">Q:</span>
                    {item.q}
                  </span>

                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${isActive ? "border-[#ff6422] bg-[#ff6422] text-white" : "border-slate-300 bg-white text-[#10283d]"}`}>
                    {isActive ? "−" : "+"}
                  </span>
                </button>

                {isActive && <div className="px-5 pb-6 sm:px-7">
                    <p className="max-w-5xl text-sm leading-6 text-slate-700 sm:text-[15px]">
                      {item.a}
                    </p>
                  </div>}
              </article>;
          })}
        </div>
      </div>
    </section></SectionBoundary>;
}
