export default function PageHero({ title, image, position = "center" }) {
  return (
    <section className="page-hero relative isolate overflow-hidden bg-[#edf6fb]">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/75 to-white/5" />
      <div className="page-wrap relative min-h-[470px]">
        <div className="relative z-10 flex min-h-[470px] max-w-full flex-col justify-center py-10 sm:max-w-[72%] lg:max-w-[56%] lg:py-14">
          <h1 className="max-w-[650px] text-left text-[28px] font-extrabold leading-[1.18] tracking-[-0.025em] text-black sm:text-[34px] lg:text-[40px] xl:text-[42px]">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
