import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { Link, useLocation } from "react-router-dom";
export default function Hero() {
  const cms = useSection("Hero");
  const { pathname } = useLocation();
  const ShalinderImg = cms("f2");
  const HeroBg = cms("f1");
  const roles = [{
    label: cms("f3"),
    path: cms("f4"),
    active: pathname === "/journey"
  }, {
    label: cms("f5"),
    path: cms("f6") && cms("f6") !== "#" ? cms("f6") : "/sewa",
    active: pathname === "/sewa"
  }, {
    label: cms("f7"),
    path: cms("f8") && cms("f8") !== "#" ? cms("f8") : "/",
    active: pathname === "/"
  }];
  return <SectionBoundary name="Hero"><section id="home" className="relative isolate overflow-hidden bg-[#edf6fb]">
      {/* Background */}
      <img src={HeroBg} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />

      {/* White gradient behind text */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/75 to-white/5" />

      <div className="page-wrap relative min-h-[470px]">
        {/* Text content */}
        <div className="relative z-20 flex min-h-[470px] max-w-full flex-col justify-center py-10 sm:max-w-[72%] lg:max-w-[56%] lg:py-14">
          <div className="max-w-[650px]">
            {/* Hindi heading */}
            <h1 className="font-hindi text-[28px] font-black leading-[1.18] tracking-[-0.025em] text-black  sm:text-[34px] lg:text-[40px] xl:text-[42px]">
              <span className="block">{cms("f9")}</span>

              <span className="block">{cms("f10")}</span>

              <span className="block">{cms("f11")}</span>
            </h1>

            {cms("f14") && <h2 className="mt-5 text-xl font-extrabold leading-tight text-[#f05d25] sm:text-2xl">
              {cms("f14")}
            </h2>}

            {/* English text */}
            <p className="mt-6 max-w-[490px] text-[15px] font-medium italic leading-[1.55] text-[#17364d] sm:text-base lg:text-[17px]">{cms("f12")}</p>

            {/* Buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {roles.map(role => role.active ? <span key={role.label} aria-current="page" aria-disabled="true" className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-full border border-[#ff6422] bg-[#ff6422] px-5 py-2.5 text-xs font-bold text-white opacity-75 shadow-inner sm:px-6 sm:text-sm">
                  {role.label}
                </span> : <Link key={role.label} to={role.path} className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#17364d] bg-white/75 px-5 py-2.5 text-xs font-bold text-[#17364d] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff6422] hover:text-[#ff6422] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6422] sm:px-6 sm:text-sm">
                  {role.label}<span aria-hidden="true" className="ml-2">↗</span>
                </Link>)}
              {cms("f15") && <Link to={cms("f16")} className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#ff6422] px-5 py-2.5 text-xs font-bold text-[#ff6422] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff6422] hover:text-white sm:px-6 sm:text-sm">
                {cms("f15")}
              </Link>}
            </div>
          </div>
        </div>

        {/* Person image */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[51%] lg:block">
          <img src={ShalinderImg} alt={cms("f13")} className="absolute bottom-0 right-[-5%] h-[97%] w-auto max-w-none object-contain object-bottom lg:h-[99%]" />
        </div>
      </div>

      {/* Mobile person background */}
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-[5] w-[70%] opacity-20 lg:hidden">
        <img src={ShalinderImg} alt="" aria-hidden="true" className="absolute bottom-0 right-[-30%] h-[85%] w-auto max-w-none object-contain object-bottom" />
      </div>
    </section></SectionBoundary>;
}
