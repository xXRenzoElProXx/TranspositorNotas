let currentTransposition = 0;
let useEnglishNotation = true;

const englishChords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const latinChords = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

const chordPattern = /\b(Do#|Re#|Fa#|Sol#|La#|Do|Re|Mi|Fa|Sol|La|Si|C#|D#|F#|G#|A#|C|D|E|F|G|A|B)(m|maj|min|sus|dim|aug|\d)*\b/g;

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

    let processedText = inputText.replace(chordPattern, (match) => {
        const transposedChord = transposeChord(match, currentTransposition);
        return `<span class="chord">${transposedChord}</span>`;
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
