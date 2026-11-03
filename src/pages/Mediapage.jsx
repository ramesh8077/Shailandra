import { PostList, SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useState } from "react";
import PageHero from "../components/PageHero";
export default function MediaPage() {
  const cms = useSection("Mediapage");
  const pressTimesNow = cms("f23");
  const pressAajTak = cms("f22");
  const pressIndiaToday = cms("f21");
  const pressNdtv = cms("f20");
  const pressZee = cms("f19");
  const galleryClassroom = cms("f18");
  const galleryMentor = cms("f17");
  const galleryHospital = cms("f16");
  const gallerySports = cms("f15");
  const galleryUniversity = cms("f14");
  const galleryFounded = cms("f13");
  const galleryAddress = cms("f12");
  const galleryImages = cms("f11");
  const bioPhoto = cms("f10");
  const quoteBooksImage = cms("f9");
  const factRecognitions = cms("f8");
  const factSports = cms("f7");
  const factHospital = cms("f6");
  const factUniversity = cms("f5");
  const factSchools = cms("f4");
  const factInstitutions = cms("f3");
  const factFounded = cms("f2");
  const heroBanner = cms("f1");
  const factSheet = [{
    title: cms("f24"),
    text: cms("f25"),
    image: factFounded
  }, {
    title: cms("f26"),
    text: cms("f27"),
    image: factInstitutions
  }, {
    title: cms("f28"),
    text: cms("f29"),
    image: factSchools
  }, {
    title: cms("f30"),
    text: cms("f31"),
    image: factUniversity
  }, {
    title: cms("f32"),
    text: cms("f33"),
    image: factHospital
  }, {
    title: cms("f34"),
    text: cms("f35"),
    image: factSports
  }, {
    title: cms("f36"),
    text: cms("f37"),
    image: factRecognitions
  }];
  const topics = [cms("f38"), cms("f39"), cms("f40"), cms("f41"), cms("f42"), cms("f43"), cms("f44"), cms("f45")];
  const bio = {
    English: cms("f46"),
    Hindi: cms("f47")
  };
  const pressLogos = [{
    name: cms("f48"),
    image: pressZee
  }, {
    name: cms("f49"),
    image: pressNdtv
  }, {
    name: cms("f50"),
    image: pressIndiaToday
  }, {
    name: cms("f51"),
    image: pressAajTak
  }, {
    name: cms("f52"),
    image: pressTimesNow
  }];
  const totalGalleryPages = 6;
  const gallery = [{
    image: galleryImages,
    alt: cms("f53")
  }, {
    image: galleryAddress,
    alt: cms("f54")
  }, {
    image: galleryFounded,
    alt: cms("f55")
  }, {
    image: galleryUniversity,
    alt: cms("f56")
  }, {
    image: gallerySports,
    alt: cms("f57")
  }, {
    image: galleryHospital,
    alt: cms("f58")
  }, {
    image: galleryMentor,
    alt: cms("f59")
  }, {
    image: galleryClassroom,
    alt: cms("f60")
  }];
  const [activeLang, setActiveLang] = useState("English");
  const [galleryPage, setGalleryPage] = useState(1);
  return <SectionBoundary name="Mediapage"><>
      <PageHero title={cms("f61")} image={heroBanner} />

      {/* My journey in the spotlight */}
      {(cms("f72") || cms("f73")) && <section className="mx-auto max-w-6xl px-6 pb-12 pt-14 sm:pb-14 sm:pt-20">
        <div className="max-w-5xl">
          <h2 className="mb-4 text-2xl font-extrabold leading-tight text-[#ff6422] sm:text-3xl">{cms("f72")}</h2>
          <p className="max-w-4xl whitespace-pre-line text-base leading-7 text-[#10283d] sm:text-lg sm:leading-8">{cms("f73")}</p>
        </div>
      </section>}

      {/* Press logos */}
      <section className="press-logos-top mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Previous" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-300 text-gray-500 hover:border-[#ff6422] hover:text-[#ff6422]">
            <span aria-hidden="true">&lsaquo;</span>
          </button>
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-5">
            {pressLogos.map(({ name, image }) => <div key={name} className="grid h-20 place-items-center rounded-md border border-gray-200 px-4">
                <img src={image} alt={name} className="max-h-12 max-w-full object-contain" />
              </div>)}
          </div>
          <button type="button" aria-label="Next" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-300 text-gray-500 hover:border-[#ff6422] hover:text-[#ff6422]">
            <span aria-hidden="true">&rsaquo;</span>
          </button>
        </div>
      </section>

      <PostList type="news" title="Online Coverage" limit={6} fallbackItems={[{
        id: "sample-online-coverage",
        slug: "sample-online-coverage",
        type: "news",
        category: "Media coverage",
        title: "Shailendra Bhadauria’s journey in education and institution building",
        excerpt: "A sample online coverage card. Replace this example by publishing a news post from the CMS admin panel.",
        body: "<p>Sample online coverage.</p>"
      }, {
        id: "sample-online-coverage-2",
        slug: "sample-online-coverage-2",
        type: "news",
        category: "Education",
        title: "Building institutions that expand access to quality education",
        excerpt: "A sample feature highlighting the work of creating stronger learning opportunities for young people.",
        body: "<p>Sample online coverage.</p>"
      }, {
        id: "sample-online-coverage-3",
        slug: "sample-online-coverage-3",
        type: "news",
        category: "Youth development",
        title: "Empowering youth through education, skills, and opportunity",
        excerpt: "A sample interview about preparing the next generation to lead, innovate, and contribute.",
        body: "<p>Sample online coverage.</p>"
      }, {
        id: "sample-online-coverage-4",
        slug: "sample-online-coverage-4",
        type: "news",
        category: "Social development",
        title: "Education, healthcare, and sport as foundations for social progress",
        excerpt: "A sample news story covering a broader vision for institution building and community impact.",
        body: "<p>Sample online coverage.</p>"
      }, {
        id: "sample-online-coverage-5",
        slug: "sample-online-coverage-5",
        type: "news",
        category: "Leadership",
        title: "A long-term vision for learning and community impact",
        excerpt: "A sample profile on leadership, service, and creating institutions that make a lasting difference.",
        body: "<p>Sample online coverage.</p>"
      }, {
        id: "sample-online-coverage-6",
        slug: "sample-online-coverage-6",
        type: "news",
        category: "Sports and youth",
        title: "How sport helps young people build confidence and character",
        excerpt: "A sample feature on using sport to support discipline, teamwork, and youth development.",
        body: "<p>Sample online coverage.</p>"
      }]} />

      {/* Fact Sheet */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-8 text-2xl font-bold text-[#ff6422]">{cms("f62")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {factSheet.map(fact => <div key={fact.title} className="rounded-md bg-gray-50 p-4">
              <img src={fact.image} alt={fact.title} className="mb-4 h-32 w-full rounded-md object-cover" />
              <p className="mb-1 font-bold text-gray-900">{fact.title}</p>
              <p className="text-sm leading-relaxed text-gray-600">{fact.text}</p>
            </div>)}
        </div>
      </section>

      {/* Quotable Thoughts */}
      <section className="bg-[#ff6422] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-center text-3xl font-extrabold text-white">{cms("f63")}</h2>
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto_1fr_auto]">
            <p className="text-lg font-semibold leading-relaxed text-white">
              <span aria-hidden="true" className="mr-1 text-3xl">&ldquo;</span>{cms("f64")}<span aria-hidden="true" className="ml-1 text-3xl">&rdquo;</span>
            </p>
            <div className="hidden h-full w-px self-stretch bg-white/40 md:block" />
            <p className="text-lg font-semibold leading-relaxed text-white">
              <span aria-hidden="true" className="mr-1 text-3xl">&ldquo;</span>{cms("f65")}<span aria-hidden="true" className="ml-1 text-3xl">&rdquo;</span>
            </p>
            <div className="justify-self-center">
              <img src={quoteBooksImage} alt={cms("f66")} className="h-24 w-auto rounded-md object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Topics */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-[#ff6422]">{cms("f67")}</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {topics.map(topic => <span key={topic} className="flex items-center gap-3 rounded-full bg-orange-100 px-5 py-3 text-sm font-semibold text-gray-800">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ff6422]">
                •
              </span>
              {topic}
            </span>)}
        </div>
      </section>

      {/* Bio */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          <div>
            <img src={bioPhoto} alt={cms("f68")} className="block h-auto w-full rounded-md object-cover" />
          </div>
          <div>
            <div className="mb-4 flex gap-6 border-b border-gray-200">
              {Object.keys(bio).map(lang => <button key={lang} type="button" onClick={() => setActiveLang(lang)} className={`border-b-2 pb-3 text-sm font-semibold transition ${activeLang === lang ? "border-[#ff6422] text-[#ff6422]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {lang}
                </button>)}
            </div>
            <p className="leading-relaxed text-gray-700">{bio[activeLang]}</p>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-[#ff6422]">{cms("f69")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gallery.map(item => <img key={item.alt} src={item.image} alt={item.alt} className="aspect-square w-full rounded-md object-cover" />)}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button type="button" onClick={() => setGalleryPage(p => Math.max(1, p - 1))} disabled={galleryPage === 1} aria-label="Previous page" className="text-[#ff6422] disabled:text-gray-300">
            ‹
          </button>
          {Array.from({
            length: totalGalleryPages
          }, (_, i) => i + 1).map(page => <button key={page} type="button" onClick={() => setGalleryPage(page)} className={`text-sm font-semibold ${galleryPage === page ? "text-[#ff6422]" : "text-gray-400 hover:text-[#ff6422]"}`}>
              {page}
            </button>)}
          <button type="button" onClick={() => setGalleryPage(p => Math.min(totalGalleryPages, p + 1))} disabled={galleryPage === totalGalleryPages} aria-label="Next page" className="text-[#ff6422] disabled:text-gray-300">
            ›
          </button>
        </div>
      </section>

      {/* Press logos */}
      <section className="hidden">
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Previous" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-300 text-gray-500 hover:border-[#ff6422] hover:text-[#ff6422]">
            ‹
          </button>
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-5">
            {pressLogos.map(({
              name,
              image
            }) => <div key={name} className="grid h-20 place-items-center rounded-md border border-gray-200 px-4">
                <img src={image} alt={name} className="max-h-12 max-w-full object-contain" />
              </div>)}
          </div>
          <button type="button" aria-label="Next" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-300 text-gray-500 hover:border-[#ff6422] hover:text-[#ff6422]">
            ›
          </button>
        </div>
      </section>

    </></SectionBoundary>;
}
