import { createContext, useContext } from 'react';
import manifest from '../../server/content-manifest.json';

const assets = import.meta.glob('../assets/**/*', {
  eager: true,
  import: 'default',
  query: '?url'
});

function assetSrc(value) {
  if (value?.startsWith('public/Journery-Images/')) {
    const filename = value.split('/').pop();
    return assets[`../assets/${filename}`] || `/${value.slice('public/'.length)}`;
  }
  if (value?.startsWith('public/')) return `/${value.slice('public/'.length)}`;
  if (!value?.startsWith('src/assets/')) return value || '';
  const key = `../assets/${value.slice('src/assets/'.length)}`;
  return assets[key] || value;
}

const sections = Object.fromEntries(Object.entries(manifest.sections).map(([key, section]) => [
  key,
  {
    en: Object.fromEntries(Object.entries(section.fields).map(([field, definition]) => [
      field,
      definition.type === 'image' ? assetSrc(definition.value) : definition.value || ''
    ])),
    hi: Object.fromEntries(Object.entries(section.fields).map(([field, definition]) => [
      field,
      definition.type === 'image' ? assetSrc(definition.value) : definition.hiValue ?? definition.value ?? ''
    ]))
  }
]));

export const staticContent = {
  sections,
  journey: manifest.journey.map((entry, order) => ({ ...entry, locale: 'en', order }))
};

const sentenceCasePreserved = new Map([
  ['ai', 'AI'],
  ['bharat', 'Bharat'],
  ['bhadauria', 'Bhadauria'],
  ['bhopal', 'Bhopal'],
  ['charcha', 'Charcha'],
  ['coffee', 'Coffee'],
  ['delhi', 'Delhi'],
  ['facebook', 'Facebook'],
  ['faq', 'FAQ'],
  ['faqs', 'FAQs'],
  ['hindi', 'Hindi'],
  ['india', 'India'],
  ['indian', 'Indian'],
  ['instagram', 'Instagram'],
  ['jaipur', 'Jaipur'],
  ['kanpur', 'Kanpur'],
  ['maharana', 'Maharana'],
  ['madhya', 'Madhya'],
  ['mpgi', 'MPGI'],
  ['ndtv', 'NDTV'],
  ['pe', 'Pe'],
  ['pratap', 'Pratap'],
  ['rajasthan', 'Rajasthan'],
  ['rohini', 'Rohini'],
  ['shailendra', 'Shailendra'],
  ['up', 'UP'],
  ['pradesh', 'Pradesh'],
  ['uttar', 'Uttar'],
  ['viksit', 'Viksit'],
  ['youtube', 'YouTube'],
  ['zee', 'ZEE']
]);

export function sentenceCase(value) {
  if (typeof value !== 'string') return value;
  return value.split(/([.!?]\s+)/u).map((part, index) => {
    if (index % 2 === 1) return part;
    let sentenceStart = true;
    return part.replace(/[\p{L}][\p{L}\p{M}'’]*/gu, word => {
      const lower = word.toLocaleLowerCase();
      const base = lower.replace(/[’']s$/u, '');
      const preserved = sentenceCasePreserved.get(base);
      let result;
      if (preserved) {
        const suffix = lower.endsWith("'s") || lower.endsWith('’s') ? "'s" : '';
        result = `${preserved}${suffix}`;
      } else if (sentenceStart) {
        result = `${lower[0]?.toLocaleUpperCase() || ''}${lower.slice(1)}`;
      } else {
        result = lower;
      }
      sentenceStart = false;
      return result;
    });
  }).join('');
}

export const ContentContext = createContext(null);
export function useSection(key) {
  const context = useContext(ContentContext);
  const definitions = manifest.sections[key]?.fields || {};
  return field => {
    const value = context?.sections[key]?.[context.locale]?.[field] || '';
    const label = definitions[field]?.label || '';
    const shouldUseSentenceCase = /^(Heading:|Subheading:|Button:|Field label:|Input hint:|FAQs\s*·\s*(question|answer):|(navItems|socialLinks)\s*·\s*name:|(cards|features|caseStudies|themes|factSheet|insights|questions|hosts)\s*·\s*(title|name|q|a):)/i.test(label);
    return shouldUseSentenceCase ? sentenceCase(value) : value;
  };
}
export function useJourney() {
  const context = useContext(ContentContext);
  return (context?.journey || [])
    .filter(j => j.locale === context.locale)
    .map(item => ({ ...item, title: sentenceCase(item.title) }));
}
