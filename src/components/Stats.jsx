import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { FaAward, FaBuilding, FaGraduationCap, FaMapLocationDot, FaUserGroup } from "react-icons/fa6";
export default function Stats() {
  const cms = useSection("Stats");
  const stats = [{
    id: 1,
    mainText: cms("f1"),
    subText: cms("f2"),
    Icon: FaGraduationCap
  }, {
    id: 2,
    mainText: cms("f3"),
    subText: cms("f4"),
    Icon: FaBuilding
  }, {
    id: 3,
    mainText: cms("f5"),
    subText: "",
    Icon: FaMapLocationDot
  }, {
    id: 4,
    mainText: cms("f6"),
    subText: "",
    Icon: FaUserGroup
  }, {
    id: 5,
    mainText: cms("f7"),
    subText: "",
    Icon: FaAward
  }];
  return <SectionBoundary name="Stats"><section className="bg-[#ff6422] py-10 text-white sm:py-12">
      <div className="page-wrap">
        {/* Heading */}
        <h2 className="mb-8 text-center text-xl font-extrabold sm:text-2xl">{cms("f8")}</h2>

        {/* Statistics */}
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12">
          {stats.map(stat => <div key={stat.id} className="flex flex-col items-center text-center lg:items-start lg:text-left">
              {/* Icon */}
              <span className="mb-3 grid h-14 w-14 place-items-center rounded-lg bg-white/90 text-2xl text-[#ff6422] shadow-sm">
                <stat.Icon aria-hidden="true" />
              </span>

              {/* Main text */}
              <strong className="block whitespace-pre-line text-base font-extrabold leading-[1.05] text-white">
                {stat.mainText}
              </strong>

              {/* Sub text */}
              {stat.subText && <span className="mt-1 block text-xs leading-tight text-orange-50">
                  {stat.subText}
                </span>}
            </div>)}
        </div>
      </div>
    </section></SectionBoundary>;
}
