import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
export default function YouthConnect() {
  const cms = useSection("YouthConnect");
  const YouthImg = cms("f1");
  return <SectionBoundary name="YouthConnect"><section id="youth-connect" className="bg-white py-12 sm:py-14 lg:py-16">
      <div className="page-wrap">
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

      </div>
    </section></SectionBoundary>;
}
