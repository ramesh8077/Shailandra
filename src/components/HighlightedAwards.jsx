const awardPhrase = /(युवा उद्यमी पुरस्कार[\s\S]{0,80}?युवा शिक्षाविद्?\s*पुरस्कार|Yuva Udyami Puraskar[\s\S]{0,80}?Yuva Sikshavid(?: awards?)?)/giu;
const isAwardPhrase = /^(?:युवा उद्यमी पुरस्कार|Yuva Udyami Puraskar)/iu;

export default function HighlightedAwards({ text, className }) {
  const parts = String(text || '').split(awardPhrase);

  return <span className={className}>
    {parts.map((part, index) => isAwardPhrase.test(part)
      ? <strong key={index} className="font-black text-black" style={{ fontWeight: 900, WebkitTextStroke: '0.2px currentColor' }}>{part}</strong>
      : part)}
  </span>;
}
