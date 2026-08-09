import { useMemo, useState } from "react";
import BackgroundBlobs from "./components/BackgroundBlobs";
import { playChord } from "./lib/audio";
import {
  partsToPlainText,
  transposeText,
  type Notation,
} from "./lib/transposer";

const FEATURES = [
  {
    title: "Transposición precisa",
    description: "Mueve todos los acordes por semitonos con Tonal.js.",
  },
  {
    title: "Notación inglesa y latina",
    description: "Alterna entre C, D, E y Do, Re, Mi sin reescribir la canción.",
  },
  {
    title: "Previsualización de acordes",
    description: "Haz clic en un acorde transpuesto para escucharlo al instante.",
  },
];

const EXAMPLE = `C              G\nHoy vuelvo a cantar\nAm             F\ncon la misma ilusión`;

function MusicIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function App() {
  const [input, setInput] = useState("");
  const [semitones, setSemitones] = useState(0);
  const [notation, setNotation] = useState<Notation>("english");
  const [copied, setCopied] = useState(false);

  const outputParts = useMemo(
    () => transposeText(input, semitones, notation),
    [input, semitones, notation],
  );
  const outputText = useMemo(() => partsToPlainText(outputParts), [outputParts]);
  const chordCount = outputParts.filter((part) => part.type === "chord").length;

  function changeSemitones(amount: number) {
    setSemitones((current) => current + amount);
  }

  function resetTransposition() {
    setSemitones(0);
  }

  function toggleNotation() {
    setNotation((current) => (current === "english" ? "latin" : "english"));
  }

  async function copyOutput() {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="app-shell relative min-h-dvh w-screen overflow-x-hidden text-white md:h-dvh md:overflow-hidden">
      <BackgroundBlobs />

      <div className="relative z-10 flex min-h-dvh w-full md:h-full">
        <aside className="brand-panel animate-fade-in-up relative hidden shrink-0 flex-col justify-center gap-10 overflow-hidden lg:flex">
          <div className="pointer-events-none absolute -left-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full border border-red-500/10" />
          <div className="pointer-events-none absolute -left-24 top-1/2 h-[20rem] w-[20rem] -translate-y-1/2 rounded-full border border-red-500/10" />

          <div className="relative">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-600/30 transition-transform duration-300 hover:scale-105">
              <MusicIcon />
            </div>
            <h1 className="max-w-sm text-4xl font-bold leading-tight tracking-tight text-white">
              Transpositor de{" "}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Notas
              </span>
            </h1>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-white/65">
              Cambia el tono de tus canciones manteniendo letras y acordes perfectamente alineados.
            </p>
          </div>

          <ul className="relative flex flex-col gap-4">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className="animate-fade-in-up flex items-start gap-3"
                style={{ animationDelay: `${150 + index * 90}ms` }}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <p className="text-base font-medium text-white/90">{feature.title}</p>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="app-footer">Renzo Enrique Crisanto Crisanto</p>
        </aside>

        <main className="tool-panel flex w-full flex-1 flex-col justify-center overflow-y-auto md:min-h-0 md:overflow-hidden">
          <div
            className="animate-fade-in-up mx-auto flex w-full max-w-5xl flex-col gap-3.5 md:h-full md:min-h-0"
            style={{ animationDelay: "80ms" }}
          >
            <div className="lg:hidden">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-600/30">
                <MusicIcon className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Transpositor de Notas</h1>
              <p className="mt-1 text-base text-white/65">Acordes, semitonos y notación al instante</p>
            </div>

            <section className="glass rounded-2xl p-3.5 sm:p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center justify-center gap-3 sm:gap-4 xl:justify-start">
                  <button
                    type="button"
                    onClick={() => changeSemitones(-1)}
                    className="control-circle"
                    aria-label="Bajar medio tono"
                    title="Bajar medio tono"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 12h14" />
                    </svg>
                  </button>

                  <div className="min-w-32 text-center">
                    <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/45">Tono actual</p>
                    <div className="glass-inset rounded-xl px-4 py-2 font-mono text-base font-bold text-orange-100">
                      {semitones === 0 ? "Original" : `${semitones > 0 ? "+" : ""}${semitones}`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => changeSemitones(1)}
                    className="control-circle"
                    aria-label="Subir medio tono"
                    title="Subir medio tono"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={toggleNotation} className="secondary-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" />
                    </svg>
                    {notation === "english" ? "C D E" : "Do Re Mi"}
                  </button>
                  <button type="button" onClick={resetTransposition} className="secondary-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
                    </svg>
                    Resetear
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-white/8 pt-3 xl:justify-start">
                <span className="mr-1 text-xs font-medium uppercase tracking-wider text-white/45">Rápido</span>
                {[
                  { label: "-1 tono", value: -2 },
                  { label: "-½ tono", value: -1 },
                  { label: "+½ tono", value: 1 },
                  { label: "+1 tono", value: 2 },
                ].map((item) => (
                  <button key={item.label} type="button" onClick={() => changeSemitones(item.value)} className="quick-button">
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="editor-grid grid gap-3 md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
              <section className="glass flex min-h-64 flex-col rounded-2xl p-3.5 sm:p-4 md:min-h-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white/90">Texto original</p>
                    <p className="mt-0.5 text-xs text-white/40">Pega la letra con sus acordes</p>
                  </div>
                  <button type="button" onClick={() => setInput("")} disabled={!input} className="icon-button" title="Borrar texto" aria-label="Borrar texto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>

                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="editor-surface min-h-48 flex-1 resize-none rounded-xl p-3.5 font-mono text-sm leading-6 text-orange-50 outline-none placeholder:text-white/25 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)] md:min-h-0"
                  placeholder={EXAMPLE}
                  spellCheck={false}
                />
              </section>

              <section className="glass flex min-h-64 flex-col rounded-2xl p-3.5 sm:p-4 md:min-h-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white/90">Resultado transpuesto</p>
                      <span className="rounded-full bg-red-500/12 px-2 py-0.5 text-[0.68rem] font-medium text-red-300">
                        {notation === "english" ? "Inglesa" : "Latina"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">
                      {chordCount ? `${chordCount} acorde${chordCount === 1 ? "" : "s"} detectado${chordCount === 1 ? "" : "s"}` : "Los acordes aparecerán resaltados"}
                    </p>
                  </div>
                  <button type="button" onClick={copyOutput} disabled={!outputText} className={`icon-button ${copied ? "animate-copy-pop text-emerald-300" : ""}`} title="Copiar resultado" aria-label="Copiar resultado">
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    )}
                  </button>
                </div>

                <div className="editor-surface output-surface min-h-48 flex-1 overflow-y-auto rounded-xl p-3.5 font-mono text-sm leading-6 text-white/75 md:min-h-0">
                  {!input ? (
                    <span className="text-white/25">El texto transpuesto aparecerá aquí automáticamente...</span>
                  ) : (
                    outputParts.map((part, index) =>
                      part.type === "chord" ? (
                        <button
                          key={`${index}-${part.value}`}
                          type="button"
                          onClick={() => playChord(part.value)}
                          className="chord-chip"
                          title={`Escuchar ${part.value}`}
                        >
                          {part.value}
                        </button>
                      ) : (
                        <span key={`${index}-${part.value.slice(0, 8)}`}>{part.value}</span>
                      ),
                    )
                  )}
                </div>
              </section>
            </div>

            <p className="app-footer pt-1 lg:hidden">Renzo Enrique Crisanto Crisanto</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
