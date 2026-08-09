import { Interval, Note } from "tonal";

export type Notation = "english" | "latin";

const LATIN_TO_ENGLISH: Record<string, string> = {
  Do: "C",
  "Do#": "C#",
  Re: "D",
  "Re#": "D#",
  Mi: "E",
  Fa: "F",
  "Fa#": "F#",
  Sol: "G",
  "Sol#": "G#",
  La: "A",
  "La#": "A#",
  Si: "B",
};

const ENGLISH_SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENGLISH_TO_LATIN: Record<string, string> = Object.fromEntries(
  Object.entries(LATIN_TO_ENGLISH).map(([latin, english]) => [english, latin]),
);

const SPANISH_WORDS = new Set([
  "cómo", "como", "con", "corazón", "cuando", "donde", "dónde", "solo", "sólo",
  "mi", "mí", "mis", "mismo", "misma", "mientras", "desde", "después", "dentro",
  "ella", "ellas", "ellos", "este", "esta", "estos", "estas", "favor", "final",
  "sobre", "ser", "sin", "son", "sus", "hasta", "hacia", "hay", "hoy", "del",
  "las", "los", "una", "uno", "para", "por", "pero", "estar", "tener", "hacer",
  "decir", "todo", "cada", "muy", "bien", "aquí", "allí", "más", "menos", "antes",
  "ahora", "siempre", "nunca", "también", "me", "te", "se", "le", "la", "lo", "al",
  "el", "de", "da", "si", "sí", "no", "re", "fe", "sol", "lado", "lados", "sos",
  "eres", "ere", "era", "eras", "eso", "esa", "ese", "esos", "esas", "somos", "qué",
  "que", "quien", "quién", "quienes", "cual", "cuál", "cuales", "cuáles", "adorar",
  "amar", "amor", "amores", "camino", "caminos", "falta", "faltas", "salud", "saludo",
  "saludos", "mundo", "mundos", "tiempo", "tiempos", "miedo", "miedos", "vida", "vidas",
  "solamente", "soledad", "soldado", "soldados", "resolver", "resolución", "resoluciones",
  "familia", "familias", "musical", "musicales", "música", "músicas", "músico", "músicos",
  "solar", "solares",
]);

const ROOT_PATTERN = "Do#?|Re#?|Mi|Fa#?|Sol#?|La#?|Si|C#?|D#?|E|F#?|G#?|A#?|B";
const SUFFIX_PATTERN = "(?:m|maj|min|sus|dim|aug|add|M)?\\d*(?:sus\\d?)?";
const CHORD_PATTERN = new RegExp(`^(${ROOT_PATTERN})(${SUFFIX_PATTERN})(?:\\/(${ROOT_PATTERN}))?$`);
const TOKEN_PATTERN = new RegExp(`(${ROOT_PATTERN})(${SUFFIX_PATTERN})(?:\\/(${ROOT_PATTERN}))?`, "g");
const AMBIGUOUS_LATIN_ROOT = /^(?:Re|Mi|Sol|La|Si)$/;

function normalizeWord(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function toEnglishRoot(root: string) {
  return LATIN_TO_ENGLISH[root] ?? root;
}

function outputRootFromEnglish(root: string, notation: Notation) {
  return notation === "latin" ? (ENGLISH_TO_LATIN[root] ?? root) : root;
}

function transposeRoot(root: string, semitones: number, notation: Notation) {
  const englishRoot = toEnglishRoot(root);
  const theoretical = Note.transpose(englishRoot, Interval.fromSemitones(semitones));
  const chroma = Note.chroma(theoretical);
  const normalized = Number.isFinite(chroma) ? ENGLISH_SHARPS[chroma] : englishRoot;
  return outputRootFromEnglish(normalized, notation);
}

function hasClearChordSyntax(token: string) {
  return /[#/0-9]|(?:maj|min|sus|dim|aug|add|m|M)$/.test(token);
}

export function isChord(token: string) {
  const clean = token.trim();
  const match = clean.match(CHORD_PATTERN);
  if (!match) return false;

  const root = match[1];
  const lower = clean.toLowerCase();
  const isLatinCandidate = root in LATIN_TO_ENGLISH;

  if (isLatinCandidate && /^[A-Z]/.test(clean)) {
    return true;
  }

  return !SPANISH_WORDS.has(lower) && !SPANISH_WORDS.has(normalizeWord(clean));
}

function isLikelyChordAt(text: string, index: number, candidate: string) {
  if (!isChord(candidate)) return false;
  if (hasClearChordSyntax(candidate)) return true;

  const root = candidate.match(CHORD_PATTERN)?.[1] ?? "";
  if (!AMBIGUOUS_LATIN_ROOT.test(root)) return true;

  const lineStart = text.lastIndexOf("\n", index - 1) + 1;
  const nextBreak = text.indexOf("\n", index);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const line = text.slice(lineStart, lineEnd);

  if (line.trim() === candidate) return true;

  const candidates = [...line.matchAll(new RegExp(`(${ROOT_PATTERN})(${SUFFIX_PATTERN})(?:\\/(${ROOT_PATTERN}))?`, "g"))]
    .map((match) => match[0])
    .filter((value) => isChord(value));

  return candidates.length >= 2;
}

export function transposeChord(chord: string, semitones: number, notation: Notation) {
  const match = chord.match(CHORD_PATTERN);
  if (!match) return chord;

  const [, root, suffix, bass] = match;
  const outputRoot = transposeRoot(root, semitones, notation);
  const outputBass = bass ? `/${transposeRoot(bass, semitones, notation)}` : "";
  return `${outputRoot}${suffix ?? ""}${outputBass}`;
}

export type OutputPart =
  | { type: "text"; value: string }
  | { type: "chord"; value: string; original: string };

export function transposeText(text: string, semitones: number, notation: Notation): OutputPart[] {
  if (!text) return [];

  const parts: OutputPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    const candidate = match[0];
    const before = text[index - 1] ?? "";
    const after = text[index + candidate.length] ?? "";
    const boundaryBefore = !before || /[\s(\[{]/.test(before);
    const boundaryAfter = !after || /[\s.,;!?)}\]]/.test(after);

    if (!boundaryBefore || !boundaryAfter || !isLikelyChordAt(text, index, candidate)) continue;

    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    parts.push({
      type: "chord",
      original: candidate,
      value: transposeChord(candidate, semitones, notation),
    });
    lastIndex = index + candidate.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: "text", value: text }];
}

export function partsToPlainText(parts: OutputPart[]) {
  return parts.map((part) => part.value).join("");
}

export function chordToEnglish(chord: string) {
  const match = chord.match(CHORD_PATTERN);
  if (!match) return chord;
  const [, root, suffix, bass] = match;
  return `${toEnglishRoot(root)}${suffix ?? ""}${bass ? `/${toEnglishRoot(bass)}` : ""}`;
}
