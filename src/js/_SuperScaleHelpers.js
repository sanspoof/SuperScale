import { get as getNote, midi, fromMidi, transpose } from "@tonaljs/note";
import { get as getScale, names as scaleNames } from "@tonaljs/scale";
import { majorKey, minorKey } from "@tonaljs/key";
import { get as getChord, detect as detectChord, notes as chordNotes } from "@tonaljs/chord";
import { funcCreateElementFromTemplate } from './_Utils';
import { _s } from './_Utils';

export function funcGetTriads(majorOrMinor, note) { 

    let key = majorOrMinor === '' ? true : false;

    let strKey = majorOrMinor === '' ? 'Major' : 'Minor';

    let objKey;

    let startingNote = note;

    let arrKeyTriads;

    let minorScaleType;

    if(key === true) {

        objKey = majorKey(note);

        arrKeyTriads = objKey.triads;

    } else {

        minorScaleType = "natural";

        objKey = minorKey(note);

        // could be "natural, harmonic, melodic"
        arrKeyTriads = objKey[minorScaleType].triads;

    }

    const TriadNotes = arrKeyTriads.map((chord) => {

        const notes = getChord(chord).notes;

        return {
            chord: chord,
            notes: notes
        };

    });

    console.log(`[SS HELPER] Triads in the Key of ${startingNote} ${strKey} ${minorScaleType || ""} : `, TriadNotes);

    return TriadNotes;

}



export function funcGetScaleNotes(note) {

    const tonic = note; // or any other root note

    const allScales = Scale.names();

    allScales.forEach(scaleName => {

    const { name, notes } = Scale.get(`${tonic} ${scaleName}`);

    console.log(name, notes);

    });

}

export function funcReturnEnharmonicEquivalent(note) { 

    const enharmonic = getNote.enharmonic(note);

    if (enharmonic) {

        return enharmonic;

    } else {

        console.error(`No enharmonic equivalent found for note: ${note}`);

        return null;
        
    }

}

export function funcGetScaleNotesByName(tonic, scaleName, showFlats, getInterval = false) {

let showFlatslocal = showFlats;

if (showFlatslocal == "true") {

    showFlatslocal = true;

    console.log("Using flats");

} else {

    showFlatslocal = false;

    console.log("Using sharps");

}

const sharpMap = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Fb': 'E',  'Cb': 'B',  'E#': 'F',  'B#': 'C'
};

const flatMap = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb', 'E#': 'F',  'B#': 'C',  'Cb': 'B',  'Fb': 'E'
};

  const scale = getScale(`${tonic} ${scaleName}`);

  if (!scale || !scale.notes.length) {

    console.error(`Scale "${scaleName}" not found for tonic "${tonic}".`);

    return [];

  }

  const map = showFlatslocal ? flatMap : sharpMap;

  const normalizedNotes = scale.notes.map(note => map[note] || note);

  if(getInterval) {

    return scale.intervals;

  }

  return normalizedNotes;

}

/**
 * Get All Scale Names Sorted by Popularity
 * @returns {Array} - An array of scale names sorted by popularity.
 */
export function funcGetAllScaleNames() {

    const popularScales = [
    "major",
    "minor",
    "major pentatonic",
    "minor pentatonic",
    "blues", // catch: major blues and minor blues
    "dorian",
    "mixolydian",
    "lydian",
    "phrygian",
    "locrian",
    "melodic minor",
    "harmonic minor",
    ];

    const allScales = scaleNames();

    const popularityIndex = name => {

    const base = name.toLowerCase();

    if (base.includes("blues")) return popularScales.indexOf("blues");

    return popularScales.indexOf(base);

    };

    const sortedScales = allScales.slice().sort((a, b) => {

    const aIndex = popularityIndex(a);

    const bIndex = popularityIndex(b);

    if (aIndex === -1 && bIndex === -1) {
        
        return a.localeCompare(b);

    } else if (aIndex === -1) {
        return 1; // b is more popular
    } else if (bIndex === -1) {
        return -1; // a is more popular
    } else {
        return aIndex - bIndex; // sort by popularity
    }
    });

    return sortedScales;

}


export function funcCreateTriad(triad, tuning, guitarNotes) {
    const FLAT_NOTES = guitarNotes.map(n => Array.isArray(n) ? n[0] : n);
    const objTuning = tuning;
    const el = funcCreateElementFromTemplate('TriadTemplate');

    const [rootNote, secondNote, thirdNote] = triad.notes;

    _s(el, 'triad-name').innerText = triad.chord;

    _s(el, 'triad-root').innerText = rootNote;

    _s(el, 'triad-second').innerText = secondNote;

    _s(el, 'triad-third').innerText = thirdNote;

    const matchNoteType = (note) => {

        if (Array.isArray(note)) {

            if (note.includes(rootNote)) return 'root';

            if (note.includes(secondNote)) return 'second';

            if (note.includes(thirdNote)) return 'third';

        } else {

            if (note === rootNote) return 'root';

            if (note === secondNote) return 'second';

            if (note === thirdNote) return 'third';

        }

        return null;
    };

    for (let stringNum = 1; stringNum <= 6; stringNum++) {

        const stringKey = stringNum.toString();

        const openNote = objTuning[stringKey];

        const openIndex = FLAT_NOTES.indexOf(openNote);

        for (let fret = 0; fret <= 5; fret++) {

            const noteIndex = (openIndex + fret) % FLAT_NOTES.length;

            const note = guitarNotes[noteIndex];

            const noteStr = Array.isArray(note) ? note.join('/') : note;

            const fretEl = el.querySelector(`[data-string="${stringKey}"][data-fret="${fret}"]`);

            if (fretEl) {

                fretEl.dataset.note = noteStr;

                const matchType = matchNoteType(note);

                if (matchType) {

                    fretEl.classList.add('active', `active--${matchType}`);
                }

                // Handle nut note
                if (fret === 0) {

                    fretEl.dataset.triadnutnote = openNote;

                    const nutMatchType = matchNoteType(openNote);

                    if (nutMatchType) {

                        fretEl.classList.add('active', `active--${nutMatchType}`);

                    }

                }

            }

        }

    }

    return el;
}