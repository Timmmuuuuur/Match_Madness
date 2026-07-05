import { GuidePage } from './GuidePage';
import { useTrack } from '../context/TrackContext';

export function GrammarPage() {
  const track = useTrack();
  return <GuidePage doc={track.grammar} />;
}
