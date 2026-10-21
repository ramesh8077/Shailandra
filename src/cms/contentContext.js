import { createContext, useContext } from 'react';
import { mediaSrc } from './api';
export const ContentContext = createContext(null);
export function useSection(key) {
  const context = useContext(ContentContext);
  return field => {
    const value = context?.sections[key]?.[context.locale]?.[field] || '';
    return value.startsWith('/api/media/') ? mediaSrc(value) : value;
  };
}
export function useJourney() {
  const context = useContext(ContentContext);
  return (context?.journey || []).filter(j => j.locale === context.locale);
}
