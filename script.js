let currentTransposition = 0;
let useEnglishNotation = true;

const englishChords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const latinChords = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

const spanishWords = new Set([
    'cómo', 'como', 'con', 'corazón', 'cuando', 'donde', 'dónde', 'solo', 'sólo',
    'mi', 'mí', 'mis', 'mismo', 'misma', 'mientras', 'desde', 'después', 'dentro',
    'ella', 'ellas', 'ellos', 'este', 'esta', 'estos', 'estas', 'favor', 'final',
    'sobre', 'ser', 'sin', 'son', 'sus', 'hasta', 'hacia', 'hay', 'hoy', 'del',
    'las', 'los', 'una', 'uno', 'para', 'por', 'pero', 'ser', 'estar', 'tener',
    'hacer', 'decir', 'todo', 'cada', 'muy', 'bien', 'aquí', 'allí', 'más',
    'menos', 'antes', 'ahora', 'siempre', 'nunca', 'también', 'solo', 'sólo',
    'me', 'te', 'se', 'le', 'la', 'lo', 'al', 'el', 'de', 'da', 'si', 'sí',
    'no', 're', 'fe', 'sol', 'lado', 'lado', 'lados', 'sos', 'eres', 'ere',
    'era', 'eras', 'eso', 'esa', 'ese', 'esos', 'esas', 'son', 'somos',
    'qué', 'que', 'quien', 'quién', 'quienes', 'cual', 'cuál', 'cuales', 'cuáles',
    'adorar', 'amar', 'amor', 'amores', 'camino', 'caminos', 'falta', 'faltas',
    'salud', 'saludo', 'saludos', 'mundo', 'mundos', 'tiempo', 'tiempos',
    'miedo', 'miedos', 'vida', 'vidas', 'solamente', 'soledad', 'soldado',
    'soldados', 'resolver', 'resolución', 'resoluciones', 'familia', 'familias',
    'musical', 'musicales', 'música', 'músicas', 'músico', 'músicos',
    'lado', 'lados', 'lado', 'lados', 'solar', 'solares', 'resolver',
    'resolución', 'resoluciones', 'lado', 'lados', 'lado', 'lados'
]);

function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function isChord(word) {
    const normalized = normalizeText(word);
    const lower = word.toLowerCase();
    return !spanishWords.has(lower) &&
        /^(Do#?|Re#?|Mi|Fa#?|Sol#?|La#?|Si|C#?|D#?|E|F#?|G#?|A#?|B)(m|maj|min|sus|dim|aug|\d*)?$/.test(word);
}

function getChordArray() {
    return useEnglishNotation ? englishChords : latinChords;
}

function getAlternateChordArray() {
    return useEnglishNotation ? latinChords : englishChords;
}

function transposeChord(chord, semitones) {
    const chords = getChordArray();
    const alternateChords = getAlternateChordArray();

    let rootNote = chord.match(/^(Do#|Re#|Fa#|Sol#|La#|Do|Re|Mi|Fa|Sol|La|Si|C#|D#|F#|G#|A#|C|D|E|F|G|A|B)/)[0];
    let suffix = chord.replace(rootNote, '');

    let currentIndex = chords.indexOf(rootNote);
    if (currentIndex === -1) {
        currentIndex = alternateChords.indexOf(rootNote);
        if (currentIndex !== -1) {
            rootNote = chords[currentIndex];
        }
    }

    if (currentIndex !== -1) {
        let newIndex = (currentIndex + semitones + 12) % 12;
        return chords[newIndex] + suffix;
    }

    return chord;
}
function processText() {
    const inputText = document.getElementById('inputText').value;
    const outputElement = document.getElementById('outputText');

    if (!inputText.trim()) {
        outputElement.textContent = 'El texto transpuesto aparecerá aquí automáticamente...';
        return;
    }

    const chordRegex = /\(([^)]+)\)|(?<=^|\s)(?:(Do#?|Re#?|Mi|Fa#?|Sol#?|La#?|Si|C#?|D#?|E|F#?|G#?|A#?|B)(m|maj|min|sus|dim|aug|\d*)?)(?=\s|[.,;!?)]|$)/g;

    let processedText = inputText.replace(chordRegex, (match, group1, base, suffix) => {
        if (group1) {
            const chords = group1.trim().split(/\s+/).map(chord => {
                return isChord(chord)
                    ? `<span class="chord">${transposeChord(chord, currentTransposition)}</span>`
                    : chord;
            });
            return `(${chords.join(' ')})`;
        } else if (base) {
            const fullChord = base + (suffix || '');
            if (isChord(fullChord)) {
                return `<span class="chord">${transposeChord(fullChord, currentTransposition)}</span>`;
            }
        }
        return match;
    });

    outputElement.innerHTML = processedText;
}

function transpose(semitones) {
    currentTransposition += semitones;
    updateCurrentKey();
    processText();
}

function quickTranspose(semitones) {
    currentTransposition += semitones;
    updateCurrentKey();
    processText();
}

function updateCurrentKey() {
    const keyElement = document.getElementById('currentKey');
    if (currentTransposition === 0) {
        keyElement.textContent = 'Original';
    } else {
        const sign = currentTransposition > 0 ? '+' : '';
        keyElement.textContent = `${sign}${currentTransposition}`;
    }
}

function resetTransposition() {
    currentTransposition = 0;
    updateCurrentKey();
    processText();
}

function toggleNotation() {
    useEnglishNotation = !useEnglishNotation;
    const notationText = document.getElementById('notationText');
    const notationIndicator = document.getElementById('notationIndicator').querySelector('span');

    if (useEnglishNotation) {
        notationText.textContent = 'Inglesa (C D E)';
        notationIndicator.textContent = 'Notación Inglesa';
    } else {
        notationText.textContent = 'Latina (Do Re Mi)';
        notationIndicator.textContent = 'Notación Latina';
    }

    processText();
}

function copyTransposedText() {
    const outputElement = document.getElementById('outputText');
    const textToCopy = outputElement.innerText;

    navigator.clipboard.writeText(textToCopy).then(() => {
        showCopyNotification();
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    });
}

function showCopyNotification() {
    const notification = document.getElementById('copyNotification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function clearText() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').textContent = 'El texto transpuesto aparecerá aquí automáticamente...';
}
