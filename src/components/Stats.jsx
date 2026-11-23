import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { FaAward, FaBuilding, FaGraduationCap, FaMapLocationDot, FaUserGroup } from "react-icons/fa6";
export default function Stats() {
  const cms = useSection("Stats");
  const stats = [{
    id: 1,
    value: cms("f1"),
    label: cms("f2"),
    Icon: FaGraduationCap
  }, {
    id: 2,
    value: cms("f3"),
    label: cms("f4"),
    Icon: FaBuilding
  }, {
    id: 3,
    value: "",
    label: cms("f5"),
    Icon: FaMapLocationDot
  }, {
    id: 4,
    value: "",
    label: cms("f6"),
    Icon: FaUserGroup
  }, {
    id: 5,
    value: "",
    label: cms("f7"),
    Icon: FaAward
  }];
  return <SectionBoundary name="Stats"><section className="bg-[#ff6422] py-10 text-white sm:py-12">
      <div className="page-wrap">
        {/* Heading */}
        <h2 className="mb-8 text-center text-xl font-extrabold sm:text-2xl">{cms("f8")}</h2>

        {/* Statistics */}
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
          {stats.map(stat => <div key={stat.id} className="flex min-w-0 flex-col items-center text-center">
              {/* Icon */}
              <span className="mb-3 grid h-14 w-14 place-items-center rounded-lg bg-white/90 text-2xl text-[#ff6422] shadow-sm">
                <stat.Icon aria-hidden="true" />
              </span>

              <div className="mt-2 flex min-h-14 flex-col items-center justify-center">
                <strong className="flex h-6 items-center justify-center text-xl font-extrabold leading-tight text-white">{stat.value}</strong>
                <span className="mt-1 max-w-full whitespace-normal text-base font-semibold leading-6 text-white capitalize">
                  {stat.label.replace(/\s+/g, " ").trim()}
                </span>
              </div>
            </div>)}
        </div>
      </div>
    </section></SectionBoundary>;
}
