import { Beat } from "@/lib/beats";

const waveformPattern = [38, 62, 44, 78, 56, 34, 70, 92, 48, 76, 58, 30, 68, 88, 54, 40];

export function BeatWaveform({ beat }: { beat: Beat }) {
  return (
    <div className="beat-waveform">
      <div className="beat-waveform-bars" aria-hidden="true">
        {waveformPattern.map((height, index) => (
          <span
            key={`${beat.id}-${index}`}
            className="beat-waveform-bar"
            style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
      <div className="beat-waveform-meta">
        <span>Waveform-ready visual lane</span>
        <span>{beat.duration} runtime</span>
      </div>
    </div>
  );
}
