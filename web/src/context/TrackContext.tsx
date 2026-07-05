import { createContext, useContext, type ReactNode } from 'react';
import type { LanguageTrackConfig } from '@shared/trackRegistry';
import { FRENCH_TRACK } from '@shared/trackRegistry';

const TrackContext = createContext<LanguageTrackConfig>(FRENCH_TRACK);

export function TrackProvider({
  track,
  children,
}: {
  track: LanguageTrackConfig;
  children: ReactNode;
}) {
  return <TrackContext.Provider value={track}>{children}</TrackContext.Provider>;
}

export function useTrack(): LanguageTrackConfig {
  return useContext(TrackContext);
}
