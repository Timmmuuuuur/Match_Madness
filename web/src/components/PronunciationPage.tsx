import { GuidePage } from './GuidePage';
import { useTrack } from '../context/TrackContext';

export function PronunciationPage() {
  const track = useTrack();
  return <GuidePage doc={track.pronunciation} />;
}
