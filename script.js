const englishChords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const latinChords = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

const englishFlats = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
};

const latinFlats = {
    'Do#': 'Reb', 'Re#': 'Mib', 'Fa#': 'Solb', 'Sol#': 'Lab', 'La#': 'Sib'
};

let currentTransposition = 0;
let originalText = '';
let useLatinNotation = false;

function normalizeChord(chord) {
    const flatsToSharps = useLatinNotation ?
        { 'Reb': 'Do#', 'Mib': 'Re#', 'Solb': 'Fa#', 'Lab': 'Sol#', 'Sib': 'La#' } :
        { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    return flatsToSharps[chord] || chord;
}

function transposeChord(chord, semitones) {
    const currentScale = useLatinNotation ? latinChords : englishChords;

    const chordRegex = useLatinNotation ?
        /^(Do|Re|Mi|Fa|Sol|La|Si)([#b]?)(.*)$/ :
        /^([A-G])([#b]?)(.*)$/;

    const match = chord.match(chordRegex);

    if (!match) return chord;

    let [, root, accidental, extension] = match;
    let fullRoot = root + accidental;
    fullRoot = normalizeChord(fullRoot);

    const rootIndex = currentScale.indexOf(fullRoot);
    if (rootIndex === -1) return chord;

    const newIndex = (rootIndex + semitones + 12) % 12;
    const newRoot = currentScale[newIndex];

    return newRoot + extension;
}

function transposeText(text, semitones) {
    const chordPattern = useLatinNotation ?
        /\b(Do|Re|Mi|Fa|Sol|La|Si)([#b]?)((?:maj|min|m|M|dim|aug|sus|add|\d)*(?:[#b]?\d+)*)\b/g :
        /\b([A-G])([#b]?)((?:maj|min|m|M|dim|aug|sus|add|\d)*(?:[#b]?\d+)*)\b/g;

    return text.replace(chordPattern, (match, root, accidental, extension) => {
        const fullChord = root + accidental + extension;
        return transposeChord(fullChord, semitones);
    });
}

function convertNotation(text, toLatin) {
    if (toLatin) {
        let convertedText = text;
        const conversions = {
            'C': 'Do', 'D': 'Re', 'E': 'Mi', 'F': 'Fa', 'G': 'Sol', 'A': 'La', 'B': 'Si',
            'Db': 'Reb', 'Eb': 'Mib', 'Gb': 'Solb', 'Ab': 'Lab', 'Bb': 'Sib'
        };

        for (const [eng, lat] of Object.entries(conversions)) {
            const regex = new RegExp(`\\b${eng}([#b]?)((?:maj|min|m|M|dim|aug|sus|add|\\d)*(?:[#b]?\\d+)*)\\b`, 'g');
            convertedText = convertedText.replace(regex, `${lat}$1$2`);
        }

        return convertedText;
    } else {
        let convertedText = text;
        const conversions = {
            'Do': 'C', 'Re': 'D', 'Mi': 'E', 'Fa': 'F', 'Sol': 'G', 'La': 'A', 'Si': 'B',
            'Reb': 'Db', 'Mib': 'Eb', 'Solb': 'Gb', 'Lab': 'Ab', 'Sib': 'Bb'
        };

        for (const [lat, eng] of Object.entries(conversions)) {
            const regex = new RegExp(`\\b${lat}([#b]?)((?:maj|min|m|M|dim|aug|sus|add|\\d)*(?:[#b]?\\d+)*)\\b`, 'g');
            convertedText = convertedText.replace(regex, `${eng}$1$2`);
        }

        return convertedText;
    }
}

function processText() {
    const inputText = document.getElementById('inputText').value;
    originalText = inputText;

    if (!inputText.trim()) {
        document.getElementById('outputText').innerHTML = 'El texto transpuesto aparecerá aquí automáticamente...';
        return;
    }

    let processedText = inputText;
    if (useLatinNotation) {
        processedText = convertNotation(inputText, true);
    }

    const transposedText = transposeText(processedText, currentTransposition);

    const chordPattern = useLatinNotation ?
        /\b(Do|Re|Mi|Fa|Sol|La|Si)([#b]?)((?:maj|min|m|M|dim|aug|sus|add|\d)*(?:[#b]?\d+)*)\b/g :
        /\b([A-G])([#b]?)((?:maj|min|m|M|dim|aug|sus|add|\d)*(?:[#b]?\d+)*)\b/g;

    const highlightedText = transposedText.replace(chordPattern, '<span class="chord">$1$2$3</span>');

    document.getElementById('outputText').innerHTML = highlightedText;
}

function transpose(semitones) {
    currentTransposition += semitones;
    updateKeyDisplay();
    processText();
}

function quickTranspose(semitones) {
    currentTransposition += semitones;
    updateKeyDisplay();
    processText();
}

function resetTransposition() {
    currentTransposition = 0;
    updateKeyDisplay();
    processText();
}

function toggleNotation() {
    useLatinNotation = !useLatinNotation;
    updateNotationDisplay();
    processText();
}

function updateKeyDisplay() {
    const keyDisplay = document.getElementById('currentKey');
    if (currentTransposition === 0) {
        keyDisplay.textContent = 'Original';
    } else if (currentTransposition > 0) {
        const tones = Math.floor(currentTransposition / 2);
        const semitones = currentTransposition % 2;
        let text = '+';
        if (tones > 0) text += `${tones}t `;
        if (semitones > 0) text += `${semitones}st`;
        keyDisplay.textContent = text.trim();
    } else {
        const tones = Math.floor(Math.abs(currentTransposition) / 2);
        const semitones = Math.abs(currentTransposition) % 2;
        let text = '-';
        if (tones > 0) text += `${tones}t `;
        if (semitones > 0) text += `${semitones}st`;
        keyDisplay.textContent = text.trim();
    }
}

function updateNotationDisplay() {
    const notationText = document.getElementById('notationText');
    const notationIndicator = document.getElementById('notationIndicator');

    if (useLatinNotation) {
        notationText.textContent = 'Notación: Latina (Do Re Mi)';
        notationIndicator.textContent = 'Notación Latina';
    } else {
        notationText.textContent = 'Notación: Inglesa (C D E)';
        notationIndicator.textContent = 'Notación Inglesa';
    }
}

updateKeyDisplay();
updateNotationDisplay();