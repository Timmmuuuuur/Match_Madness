import guideData from '@shared/data/guide-pronunciation.json';
import type { GuideDocument } from '@shared/types';
import { GuidePage } from './GuidePage';

export function PronunciationPage() {
  return <GuidePage doc={guideData as GuideDocument} />;
}
