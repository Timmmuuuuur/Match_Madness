import guideData from '@shared/data/guide-grammar.json';
import type { GuideDocument } from '@shared/types';
import { GuidePage } from './GuidePage';

export function GrammarPage() {
  return <GuidePage doc={guideData as GuideDocument} />;
}
