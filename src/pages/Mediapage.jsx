import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useState } from "react";
import PageHero from "../components/PageHero";
import { PostList } from "../cms/PublicCMS";
import HighlightedAwards from "../components/HighlightedAwards";
import nationTodayClipping from "../../uploads/c492c7e2-9135-4318-b253-83004b656253.webp";
import sundayChronicleClipping from "../../uploads/014f436f-61c8-4aa4-8bb8-5c92d42bf9e5.webp";
import dailyTimesClipping from "../../uploads/5a8648a5-f87c-41f6-83dd-2183ad09e949.webp";
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
  const heroTitle = "Media centre";
  return <SectionBoundary name="Mediapage"><div className="media-page-headings">
      <PageHero title={heroTitle} image={heroBanner} />

      {/* Press logos directly after the banner */}
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

      <PostList
        type="news"
        category="Digital Spotlight"
        title="In the digital spotlight"
        limit={8}
        layout="rail"
        outbound
        searchable={false}
        fallbackItems={[
          {
            id: 'media-ht-gen-z-viksit-bharat',
            type: 'news',
            category: 'Digital Spotlight',
            title: 'Preparing Gen Z for the Viksit Bharat mission',
            excerpt: 'Shailendra Bhadauria writes about helping young people build flexible careers and contribute to India’s development.',
            sourceUrl: 'https://www.hindustantimes.com/ht-insight/governance/preparing-gen-z-for-the-viksit-bharat-mission-101788696841544.html',
            publication: 'Hindustan Times'
          },
          {
            id: 'media-hans-india-higher-education',
            type: 'news',
            category: 'Digital Spotlight',
            title: 'What students need from higher education today?',
            excerpt: 'A perspective on combining academic learning with practical experience, adaptability and real-world skills.',
            sourceUrl: 'https://assets.thehansindia.com/hans/young-hans/what-students-need-from-higher-education-today-1133104',
            publication: 'The Hans India'
          },
          {
            id: 'media-toi-campus-isolation-wards',
            type: 'news',
            category: 'Digital Spotlight',
            title: 'Kanpur: Educationist offers campuses for setting up isolation wards',
            excerpt: 'A Times of India report on Maharana Pratap Group offering campus space and facilities during the COVID-19 response.',
            sourceUrl: 'https://timesofindia.indiatimes.com/city/kanpur/educationist-offers-campuses-for-setting-up-isolation-wards/amp_articleshow/74764515.cms',
            publication: 'The Times of India'
          },
          {
            id: 'media-business-standard-kanpur-university',
            type: 'news',
            category: 'Digital Spotlight',
            title: 'Kanpur set to get first pvt varsity',
            excerpt: 'Business Standard reported on the Maharana Pratap Group’s university plans and expansion in Uttar Pradesh.',
            sourceUrl: 'https://www.business-standard.com/article/economy-policy/kanpur-set-to-get-first-pvt-varsity-109052200030_1.html',
            publication: 'Business Standard'
          }
        ]}
        emptyMessage="No digital news coverage has been added yet."
      />
      <PostList
        type="news"
        category="Print Spotlight"
        title="In the print spotlight"
        limit={8}
        layout="rail"
        imageLightbox
        searchable={false}
        fallbackItems={[
          {
            id: 'print-nation-today-stronger-tomorrow',
            type: 'news',
            category: 'Print Spotlight',
            title: 'A Stronger Tomorrow Together',
            excerpt: 'Nation Today · Development, opportunities and people first.',
            cover: nationTodayClipping
          },
          {
            id: 'print-sunday-chronicle-people-progress',
            type: 'news',
            category: 'Print Spotlight',
            title: 'People at the Heart of Progress',
            excerpt: 'The Sunday Chronicle · A conversation on development, opportunities and a stronger society.',
            cover: sundayChronicleClipping
          },
          {
            id: 'print-daily-times-leadership',
            type: 'news',
            category: 'Print Spotlight',
            title: 'Leadership for a Stronger Tomorrow',
            excerpt: 'The Daily Times · Vision, commitment and impact.',
            cover: dailyTimesClipping
          }
        ]}
        emptyMessage="No newspaper clippings have been added yet. Upload print coverage under Print Spotlight in the CMS."
      />

      {/* Fact Sheet */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 max-w-4xl">
          <h2 className="mb-3 text-2xl font-bold leading-tight text-[#ff6422] sm:text-3xl">{cms("f62")}</h2>
          {(cms("f72") || cms("f73")) && <div className="max-w-4xl">
            {cms("f72") && <h3 className="mb-1 text-sm font-bold leading-6 text-gray-900">{cms("f72")}</h3>}
            {cms("f73") && <p className="whitespace-pre-line text-sm leading-[1.6] text-gray-900 sm:text-base">{cms("f73")}</p>}
          </div>}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {factSheet.map(fact => <div key={fact.title} className="rounded-md bg-gray-50 p-4">
              <img src={fact.image} alt={fact.title} className="mb-4 aspect-[3/2] w-full rounded-md bg-slate-100 object-contain" />
              <p className="mb-1 font-bold text-gray-900">{fact.title}</p>
              <p className="text-sm leading-relaxed text-gray-600"><HighlightedAwards text={fact.text} /></p>
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
            <p className="leading-relaxed text-gray-700"><HighlightedAwards text={bio[activeLang]} /></p>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-[#ff6422]">{cms("f69")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gallery.map(item => <img key={item.alt} src={item.image} alt={item.alt} className="aspect-square w-full rounded-md bg-slate-100 object-contain" />)}
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

    </div></SectionBoundary>;
}
