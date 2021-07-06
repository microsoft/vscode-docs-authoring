import { fileTypes } from './models';

export function matchesFileType(languageId: string) {
  const matches = fileTypes.includes(languageId);
  return matches;
}
