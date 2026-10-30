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

export const ContentContext = createContext(null);
export function useSection(key) {
  const context = useContext(ContentContext);
  return field => {
    const value = context?.sections[key]?.[context.locale]?.[field] || '';
    return value;
  };
}
export function useJourney() {
  const context = useContext(ContentContext);
  return (context?.journey || []).filter(j => j.locale === context.locale);
}
