import { Chord, Note } from "tonal";
import { Howl } from "howler";
import { chordToEnglish } from "./transposer";

const BASE_MIDI = 60;

function buildVoice(rate: number, volume: number) {
  return new Howl({
    src: ["/tone.wav"],
    volume,
    rate,
    html5: false,
  });
}

export function playChord(chordLabel: string) {
  const english = chordToEnglish(chordLabel);
  const chord = Chord.get(english);
  const noteNames = chord.notes.length ? chord.notes.slice(0, 4) : [english.match(/^[A-G](?:#|b)?/)?.[0] ?? "C"];

  noteNames.forEach((noteName, index) => {
    const midi = Note.midi(`${noteName}${index === 0 ? 4 : 5}`);
    if (midi === null) return;
    const rate = 2 ** ((midi - BASE_MIDI) / 12);
    const voice = buildVoice(rate, 0.18 / Math.max(1, noteNames.length * 0.55));
    voice.once("end", () => voice.unload());
    voice.play();
  });
}
