export default function PageHero({ title, image, position = "center" }) {
  return (
    <section className="relative grid min-h-[240px] place-items-center overflow-hidden bg-[#10283d] sm:min-h-[320px] lg:min-h-[400px]">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#10283d]/75 via-[#10283d]/55 to-[#10283d]/35" />
      <h1 className="relative z-10 max-w-[90%] text-center text-3xl font-extrabold tracking-wide text-white sm:text-5xl lg:text-6xl">
        {title}
      </h1>
    </section>
  );
}
