import { useLocation } from 'react-router-dom';
import { useSection } from '../cms/contentContext';

export function PageClosingThoughts() {
  const { pathname } = useLocation();
  const vision = useSection('vision2047');
  const education = useSection('EducationPage');
  const nationBuilding = useSection('Nationbuildingpage');
  const copy = pathname === '/vision-2047'
    ? [vision('f33'), vision('f34')]
    : pathname === '/education'
      ? [education('f48'), education('f49')]
      : pathname === '/nation-building'
        ? [nationBuilding('f30'), nationBuilding('f31')]
        : null;

  if (!copy?.[0] || !copy?.[1]) return null;
  return <section className="mx-auto max-w-6xl px-6 py-12">
    <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{copy[0]}</h2>
    <p className="whitespace-pre-line leading-relaxed text-gray-700">{copy[1]}</p>
  </section>;
}
