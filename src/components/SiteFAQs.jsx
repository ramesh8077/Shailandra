import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useSection } from "../cms/contentContext";

export default function SiteFAQs() {
  const { pathname } = useLocation();
  const youth = useSection("YouthConnect");
  const education = useSection("EducationPage");
  const nationBuilding = useSection("Nationbuildingpage");
  const upDevelopment = useSection("Updevelopmentpage");
  const vision = useSection("vision2047");
  const [openIndex, setOpenIndex] = useState(-1);

  const questionsByPage = {
    "/education": [
      [education("f7"), education("f45")],
      [education("f8"), education("f46")],
      [education("f9"), education("f47")],
      [education("f41"), education("f42")],
      [education("f43"), education("f44")]
    ],
    "/nation-building": [
      [nationBuilding("f11"), nationBuilding("f41")],
      [nationBuilding("f12"), nationBuilding("f42")],
      [nationBuilding("f13"), nationBuilding("f43")],
      [nationBuilding("f37"), nationBuilding("f38")],
      [nationBuilding("f39"), nationBuilding("f40")]
    ],
    "/updevelopment": [
      [upDevelopment("f18"), upDevelopment("f43")],
      [upDevelopment("f19"), upDevelopment("f44")],
      [upDevelopment("f20"), upDevelopment("f45")],
      [upDevelopment("f39"), upDevelopment("f40")],
      [upDevelopment("f41"), upDevelopment("f42")]
    ],
    "/vision-2047": [
      [vision("f18"), vision("f41")],
      [vision("f19"), vision("f42")],
      [vision("f20"), vision("f43")],
      [vision("f44"), vision("f45")],
      [vision("f46"), vision("f47")]
    ]
  };
  const pageQuestions = questionsByPage[pathname];
  const questions = (pageQuestions || [
    [youth("f2"), youth("f3")],
    [youth("f4"), youth("f5")],
    [youth("f6"), youth("f7")],
    [youth("f8"), youth("f9")],
    [youth("f10"), youth("f11")]
  ]).filter(([question, answer]) => question && answer);

  return <section className="bg-white">
    <div className="page-wrap">
      <h2 className="mb-6 text-center text-2xl font-extrabold text-[#ff6422] sm:text-3xl">FAQs</h2>
      <div className="mx-auto max-w-5xl space-y-3">
        {questions.map(([question, answer], index) => <article key={question} className="overflow-hidden rounded-md border border-gray-200">
          <button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)} aria-expanded={openIndex === index} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50">
            <span>{question}</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gray-300 text-lg text-gray-500">{openIndex === index ? "−" : "+"}</span>
          </button>
          {openIndex === index && <p className="whitespace-pre-line border-t border-gray-200 px-5 py-4 text-sm leading-relaxed text-gray-600">{answer}</p>}
        </article>)}
      </div>
    </div>
  </section>;
}
