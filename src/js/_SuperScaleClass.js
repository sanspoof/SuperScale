import * as scaleData from './data.json';
import { funcGetTriads, funcCreateTriad, funcGetAllScaleNames, funcGetScaleNotesByName } from './_SuperScaleHelpers';
export class SuperScaleApp {

    constructor() {

      this.ChordFormulas = scaleData.ChordFormulas;
      this.guitarNeck = document.querySelector('#Guitar');
      this.TriadContainer = document.querySelector('#Triads');
      this.scaleName = document.querySelector('[data-val="scalename"]');
      this.scaleNotes = document.querySelector('[data-val="scalenotes"]');
      this.observer = null;
      this.funcReturnMutation = this.funcReturnMutation.bind(this);
      this.storageKey = 'superScaleSettings';
      this.defaults = { 
        scale:"minor", 
        position:0, 
        key:"C", 
        showAllNotes:"true",
        showFlats:"true", 
        display:"notes", 
        showFretNumbers:"true",
        tuning:{ 1:"E", 2:"B", 3:"G", 4:"D", 5:"A", 6:"E" },
        fullFretboard:"false"
      };

      this.settings = this.loadSettingsFromStorage() || {}; 
      this.settings = this.createPassiveSettingsProxy(this.settings);
      this.settings.scale = this.settings.scale || this.defaults.scale;
      this.settings.position = this.settings.position || this.defaults.position;
      this.settings.showAllNotes = this.settings.showAllNotes || this.defaults.showAllNotes;
      this.settings.showFlats = this.settings.showFlats || this.defaults.showFlats;
      this.settings.key = this.settings.key || this.defaults.key;
      this.settings.display = this.settings.display || this.defaults.display;
      this.settings.tuning = this.settings.tuning || this.defaults.tuning;
      this.settings.showFretNumbers = this.settings.showFretNumbers || this.defaults.showFretNumbers;
      this.settings.fullFretboard = this.settings.fullFretboard || this.defaults.fullFretboard;

        this.strings = Array.from({ length: 6 }, (_, i) => i + 1);
 
        this.nutstrings = Array.from({ length: 6 }, (_, i) => i + 1);
    
        this.strings.forEach((num) => {

          this[`string${num}`] = document.querySelector(`[data-string="${num}"]`);

          this[`nutstring${num}`] = document.querySelector(`[data-nutstring="${num}"]`);

        });

      this.guitarNotes = scaleData.GuitarNotes.notes;

      
    }

    init() {

        this.funcSetupFretboard();
        this.funcSetupControls();
        this.funcObserveNut();
 
        

    }

    destroy() {
        
    }


    funcNewMutationObs(cb) {

        this.observer = new MutationObserver((mutationsList) => {
    
            for (const mutation of mutationsList) {
        
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-nutnote') {
        
                  // Handle the change in the 'data-nutnote' attribute here
        
                  const newValue = mutation.target.getAttribute('data-nutnote');
        
                  mutation.target.innerHTML = newValue;
    
                  cb(newValue, mutation.target);
    
                }
        
              }
        
        });
    
    }

    funcFlattenTuning() {

      const tuning = this.settings.tuning;

      let result = ''; 
      for(let i = 6; i >= 1; i--) {
        result += tuning[i];
      }

      result = result.toLowerCase();

      return result;

    }

    funcSetupScaleDropdown(dd) { 

        let scaleNames = funcGetAllScaleNames();

        scaleNames.forEach(name => {

        const option = document.createElement("option");

        option.value = name;

        option.textContent = name;

        option.dataset.setting = name;

        dd.appendChild(option);

      });

    }

funcHighlightMatchingNotes() {

  const container = this.guitarNeck; 

  // Remove any existing listeners to avoid duplication, if needed
  container.removeEventListener('mouseover', this.handleMouseOver);

  container.removeEventListener('mouseout', this.handleMouseOut);

  // Need to be defined to allow to remove them later

  this.handleMouseOver = (event) => {

    const el = event.target.closest('[data-note]');

    if (!el) return;

    const dataNoteValues = el.getAttribute('data-note').split(':');

    document.querySelectorAll('[data-note]').forEach(otherEl => {

      const otherNotes = otherEl.getAttribute('data-note').split(':');

      if (dataNoteValues.some(note => otherNotes.includes(note))) {

        otherEl.classList.add('guitar__note--matchinghover');

      }

    });

  };

  this.handleMouseOut = (event) => {

    const el = event.target.closest('[data-note]');

    if (!el) return;

    const dataNoteValues = el.getAttribute('data-note').split(':');

    document.querySelectorAll('[data-note]').forEach(otherEl => {

      const otherNotes = otherEl.getAttribute('data-note').split(':');

      if (dataNoteValues.some(note => otherNotes.includes(note))) {

        otherEl.classList.remove('guitar__note--matchinghover');

      }

    });

  };

  container.addEventListener('mouseover', this.handleMouseOver);

  container.addEventListener('mouseout', this.handleMouseOut);

}

    funcFindCommonNotes() {

      const allNotes = this.guitarNotes;

      const selectedNotes = this.funcGetScaleNotes(this.settings.key, this.settings.scale);
      
      // Flatten the nested array structure
      const flattenedNotes = allNotes.flat();
      
      const commonNotes = flattenedNotes.filter(note => selectedNotes.includes(note));

      return commonNotes;

    }

    funcObserveNut() {

        this.funcNewMutationObs(this.funcReturnMutation);
    
        // Define the configuration for the observer
    
        const config = { attributes: true, attributeFilter: ['data-nutnote'] };
    
        // Observe changes on elements with data-nutstring
        for (let i = 1; i <= 6; i++) {
    
        const targetElement = document.querySelector(`[data-nutstring="${i}"]`);
    
        if (targetElement) {

            this.observer.observe(targetElement, config); 
    
        }
    
    }
    
    }

    funcReturnMutation(newValue, target) {

        let el = target;
        
        console.log("New NOTE is",newValue , "the Target String is", el.dataset.nutstring );
    
        this.addFretAndNote(this[`string${el.dataset.nutstring}`], this.funcSetTuningBasedOnNutNote(newValue));

        this.funcSetupNotesDisplay(this.settings.scale);
 
        this.settings.tuning[el.dataset.nutstring] = newValue;
        
        this.saveSettings();

    } 

    funcDisconnectNutObserver() {
    
        this.observer.disconnect();
        
    }

    addFretAndNote(stringElement, startNote) {

        let stringNumber = stringElement.dataset.string;

        let startingNutNote = startNote;

        const templateGuitarFret = document.querySelector('#guitarfret');

        let el = this[`string${stringNumber}`];

        let fretCount;

        if(this.settings.fullFretboard == "true") { 

          fretCount = 24;
 
        } else {

          fretCount = 12;

        }

        el.innerHTML = '';

        for (let i = 1; i <= fretCount; i++) {

          const el = templateGuitarFret.content.cloneNode(true);

          const fretElement = el.querySelector('[data-fret]');

          const noteElement = el.querySelector('[data-note]');
      
          fretElement.setAttribute('data-fret', i);

          if(Array.isArray(startingNutNote)) { 

            const combinedNotes = startingNutNote.join(':');

            noteElement.setAttribute('data-note', combinedNotes);

            // Clear the noteElement content
            noteElement.innerHTML = '';

            // Add each note in a separate <span>
            startingNutNote.forEach(note => {

                const span = document.createElement('span');

                if(note.includes('#')) {

                    span.classList.add('guitar__note--sharp');

                } else {
                  
                    span.classList.add('guitar__note--flat');
                }

                span.textContent = note;

                noteElement.appendChild(span);

            });

            noteElement.classList.add('guitar__note--sharpflat');

          } else {

            noteElement.setAttribute('data-note', startingNutNote);

            noteElement.textContent = startingNutNote;

          }

          stringElement.appendChild(el);

          startingNutNote = this.getNextNote(startingNutNote, this.guitarNotes);

        }

        this.funcSetNutMarkup();

      }

      getNextNote(currentNote, guitarNotes ) {
       
        const index = guitarNotes.indexOf(currentNote);
      
        const nextIndex = (index + 1) % guitarNotes.length;

        return guitarNotes[nextIndex];

      }


      funcSetNutMarkup() {

        const elNutnotes = document.querySelectorAll('[data-nutnote]');

        elNutnotes.forEach(elNutnote => { 

            const nutnote = elNutnote.dataset.nutnote;

            elNutnote.textContent = nutnote;

        });

      }

    funcSetupFretboard() {

        document.querySelector(`[data-nutstring="1"]`).dataset.nutnote = this.settings.tuning[1];
        document.querySelector(`[data-nutstring="2"]`).dataset.nutnote = this.settings.tuning[2];
        document.querySelector(`[data-nutstring="3"]`).dataset.nutnote = this.settings.tuning[3];
        document.querySelector(`[data-nutstring="4"]`).dataset.nutnote = this.settings.tuning[4];
        document.querySelector(`[data-nutstring="5"]`).dataset.nutnote = this.settings.tuning[5];
        document.querySelector(`[data-nutstring="6"]`).dataset.nutnote = this.settings.tuning[6];

        for(let i = 1; i <= 6; i++) { 

            this.addFretAndNote(this[`string${i}`], this.funcSetTuningBasedOnNutNote(this[`nutstring${i}`].dataset.nutnote));

        }

        this.funcSetupNotesDisplay(this.settings.scale);
        
        this.guitarNeck.classList.add("position-" + this.settings.position);

        this.funcHighlightMatchingNotes();

        this.functionCreateTriadsBasedOnKey();


    }

    funcSetupScaleWording() {

      this.scaleName.textContent = this.settings.key + ' ' + this.settings.scale;

    }

    funcSetupScaleNotes() {

      let notes = this.funcGetScaleNotes(this.settings.key, this.settings.scale);

      this.scaleNotes.innerHTML = '';

      notes.forEach(note => {

        const noteDiv = document.createElement('div');

        noteDiv.classList.add('scaleinfo__note');

        noteDiv.textContent = note;

        this.scaleNotes.appendChild(noteDiv);

        if(note === this.settings.key) { 

          noteDiv.classList.add('scaleinfo__note--root');

        }

      });

    }

    funcSetupNotesDisplay(scale) {

        const elements = document.querySelectorAll('[data-note]');

        const notes = this.funcFindCommonNotes();

        elements.forEach(el => { 

            el.classList.remove('guitar__note--active', 'guitar__note--root');
            
        });

        if(scale === 'none') { 

            return;

        } 

        if(scale === 'chromatic') { 

              elements.forEach(el => {

                el.classList.add('guitar__note--active');

              });

            return;

      }

      notes.forEach((note) => {
        
        const elements = document.querySelectorAll('[data-note]');
      
        elements.forEach(el => {

          const dataNoteValues = el.getAttribute('data-note').split(':');
          
          if (dataNoteValues.includes(note)) {

            el.classList.add('guitar__note--active');

          }

        });

      });

    this.funcSetupScaleWording();

    this.funcSetupScaleNotes();

    this.funcApplyIntervalsToFretboard();

    }

    funcApplyIntervalsToFretboard() {

        this.guitarNeck.querySelectorAll('.guitar__interval').forEach(el => el.remove());

        const notes = this.funcGetScaleNotes(this.settings.key, this.settings.scale);

        const intervals = this.funcGetScaleIntervals(this.settings.key, this.settings.scale);

        const noteIntervalMap = notes.map((note, index) => ({
          note: note,
          interval: intervals[index]
        }));

        noteIntervalMap.forEach(({ note, interval }) => {
          
          document.querySelectorAll('[data-note]').forEach(el => {

            const dataNoteValues = el.getAttribute('data-note').split(':');

            if (dataNoteValues.includes(note)) {

              el.setAttribute('data-interval', interval);

            }

          });

        });

        this.guitarNeck.querySelectorAll('[data-interval]').forEach(function(el) {

          const interval = el.getAttribute('data-interval');

          const intervalParent = el.parentElement;
   
          const elInterval = document.createElement("div");

          elInterval.classList.add('guitar__interval');

          elInterval.innerText = interval;

          intervalParent.appendChild(elInterval)

        });

    }

      functionCreateTriadsBasedOnKey() {

        this.TriadContainer.innerHTML = '';

        let objCurrentTuning = this.settings.tuning;

        let arrAllTriads = funcGetTriads('', this.settings.key);

        arrAllTriads.forEach((triad) => {

          //console.log(triad);

          let a = funcCreateTriad(triad, objCurrentTuning, this.guitarNotes);

          this.TriadContainer.appendChild(a);

        });

      }

    funcSetTuningBasedOnNutNote(nutnote) { 
        const targetValue = nutnote;
      
        const index = this.guitarNotes.indexOf(targetValue);
      
        if (index !== -1) {
          let newIndex = index + 1;
      
          if (newIndex >= this.guitarNotes.length) {
            // If newIndex is out of bounds, wrap it to the start of the array
            newIndex = 0;
          }
      
          // Do something with this.guitarNotes[newIndex]
          return this.guitarNotes[newIndex];
        }
      }

    funcSetupControls() {
        
        const controls = document.querySelectorAll('[data-role="switcher"]');

        const selectElement = document.querySelector('[data-role="switcher-select"]');

        const selectEl = document.querySelector('#selectedScale');

        const selectTuning = document.querySelector('#setTuning');
        
        const selectFretcount = document.querySelector('#setFrets');

        const radioShowAllNotes = document.querySelector('input[name="notes"][value="all"]');

        const radioShowScaleNotesOnly = document.querySelector('input[name="notes"][value="scaleonly"]');
      
        const radioShowSharps = document.querySelector('input[name="sharpsflats"][value="sharps"]');

        const radioShowFretNumbers = document.querySelector('input[name="fretmarker"][value="number"]');

        const radioShowFretMarkers = document.querySelector('input[name="fretmarker"][value="marker"]');

        const radioShowFlats = document.querySelector('input[name="sharpsflats"][value="flats"]');

        const radioShowNotes = document.querySelector('input[name="notesorintervals"][value="notes"]');

        const radioShowIntervals = document.querySelector('input[name="notesorintervals"][value="intervals"]');

        let selectedScale = this.settings.scale;

        this.funcSetupScaleDropdown(selectEl); // sets the dropdown with all scales

          for (var i = 0; i < selectEl.options.length; i++) {

            if (selectEl.options[i].value === selectedScale) {

                // Set the selected attribute 
                selectEl.options[i].selected = true;

                break; // Exit the loop once the option is found

              }

          }


        if (selectElement) { 

            selectElement.addEventListener('change', (event) => {

              const selectedOption = event.target.selectedOptions[0];

              const dataVal = selectedOption.value;
        
                if (dataVal) {

                    this.settings.scale = dataVal;

                    this.funcSetupNotesDisplay(this.settings.scale);
                    
                    
                    
                  }

            });

          }

          if(selectTuning) {

            let flattenedTuning = this.funcFlattenTuning();

            console.log("FLATT", flattenedTuning);

            for (var i = 0; i < selectTuning.options.length; i++) {

            if (selectTuning.options[i].value === flattenedTuning) {

                // Set the selected attribute 
                selectTuning.options[i].selected = true;

                break; // Exit the loop once the option is found

              }

          }

            selectTuning.addEventListener('change', (event) => {

              const selectedOption = event.target.selectedOptions[0];

              const dataVal = selectedOption.dataset.setting;

              if (dataVal) {

                const tuning = {};

                tuning[1] = dataVal[5].toUpperCase(); // E
                tuning[2] = dataVal[4].toUpperCase(); // B
                tuning[3] = dataVal[3].toUpperCase(); // G
                tuning[4] = dataVal[2].toUpperCase(); // D
                tuning[5] = dataVal[1].toUpperCase(); // A
                tuning[6] = dataVal[0].toUpperCase(); // E

                document.querySelector(`[data-nutstring="1"]`).dataset.nutnote = tuning[1];
                document.querySelector(`[data-nutstring="2"]`).dataset.nutnote = tuning[2];
                document.querySelector(`[data-nutstring="3"]`).dataset.nutnote = tuning[3];
                document.querySelector(`[data-nutstring="4"]`).dataset.nutnote = tuning[4];
                document.querySelector(`[data-nutstring="5"]`).dataset.nutnote = tuning[5];
                document.querySelector(`[data-nutstring="6"]`).dataset.nutnote = tuning[6];

                this.settings.tuning = tuning;

                this.functionCreateTriadsBasedOnKey();

              }

            });

          }

          if(selectFretcount) {

            selectFretcount.value = this.settings.fullFretboard;

            if(this.settings.fullFretboard == "true") { 

              this.guitarNeck.classList.add('full24frets'); 

            } else {

              this.guitarNeck.classList.remove('full24frets');

            }

            selectFretcount.addEventListener('change', (event) => {

              const selectedOption = event.target.selectedOptions[0];

              const dataVal = selectedOption.value;

              console.log("DATA VAL", dataVal)

              if (dataVal) {

                this.settings.fullFretboard = dataVal;

              }

              if(dataVal == "true") { 

                this.guitarNeck.classList.add('full24frets');

                this.funcSetupFretboard();

              } else {

                this.guitarNeck.classList.remove('full24frets');

                this.funcSetupFretboard();

              }

            });

          }

        if(radioShowAllNotes) { 

          if(this.settings.showAllNotes == "true") { 

            radioShowAllNotes.checked = true;
            
          } else {

            radioShowScaleNotesOnly.checked = true;

            this.guitarNeck.classList.add('showscalenotesonly');

          }

          const radios = document.querySelectorAll('input[name="notes"]');

          radios.forEach(radio => {

            radio.addEventListener('change', (e) => {

              if (e.target.value == 'all') {

                this.settings.showAllNotes = "true";

                this.guitarNeck.classList.remove('showscalenotesonly');

              } else if (e.target.value == 'scaleonly') {

                this.guitarNeck.classList.add('showscalenotesonly');

                this.settings.showAllNotes = "false";

              }

            });

          });

        }

        if(radioShowFlats) { 

          if(this.settings.showFlats == "true") { 

            radioShowFlats.checked = true;

            this.guitarNeck.classList.add('showflats');
            
          } else {

            radioShowSharps.checked = true;

            this.guitarNeck.classList.remove('showflats');

          }

          const radios = document.querySelectorAll('input[name="sharpsflats"]');

          radios.forEach(radio => {

            radio.addEventListener('change', (e) => {

              if (e.target.value === 'sharps') {

                this.settings.showFlats = "false";

                this.guitarNeck.classList.remove('showflats');

              } else if (e.target.value === 'flats') {

                this.settings.showFlats = "true";

                this.guitarNeck.classList.add('showflats');

              }

            });

          });

        }

        if(radioShowFretNumbers) {

          if(this.settings.showFretNumbers == "true") {

            radioShowFretNumbers.checked = true;

            this.guitarNeck.classList.remove('showfretmarkers');

          } else {

            radioShowFretMarkers.checked = true;

            this.guitarNeck.classList.add('showfretmarkers');

          }

          const radios = document.querySelectorAll('input[name="fretmarker"]');

          radios.forEach(radio => {

            radio.addEventListener('change', (e) => {

              console.log("Fret Marker Change", e.target.value);

              if (e.target.value === 'number') {

                this.settings.showFretNumbers = "true";

                this.guitarNeck.classList.remove('showfretmarkers');

              } else if (e.target.value === 'marker') {

                this.settings.showFretNumbers = "false";

                this.guitarNeck.classList.add('showfretmarkers');

              }
 
            });

          });

        }

        // fyi: intervals or notes 
        if(radioShowNotes) {

          if(this.settings.display == "notes") { 

            radioShowNotes.checked = true;

            this.guitarNeck.classList.remove('showintervals');

          } else {

            radioShowIntervals.checked = true;

            this.guitarNeck.classList.add('showintervals');

          }

          const radios = document.querySelectorAll('input[name="notesorintervals"]');

            radios.forEach(radio => {

            radio.addEventListener('change', (e) => {

              if (e.target.value === 'notes') {

                this.settings.display = "notes";

                this.guitarNeck.classList.remove('showintervals');

              } else if (e.target.value === 'intervals') {

                this.settings.display = "intervals";

                this.guitarNeck.classList.add('showintervals');

              }

            });

          });

        }

        controls.forEach(control => {

          const toggleButtons = control.querySelectorAll('[data-val]');
    
          toggleButtons.forEach(button => { 

            let keyValue = button.dataset.val;

            //console.log(keyValue)

            if (keyValue.split('-')[1] === this.settings.key) {

              button.classList.add('active');

            }

            if (keyValue === this.settings.display) {

              button.classList.add('active');

            }

            if(Number(keyValue.split('-')[1]) === this.settings.position) {

              button.classList.add('active');

            }
          
          });

          toggleButtons.forEach(button => {

            button.addEventListener('click', () => {

                button.parentNode.querySelectorAll('[data-val]').forEach(button => { 

                    button.classList.remove('active');

                });

                button.classList.add('active');

              const dataVal = button.getAttribute('data-val');

              if (dataVal) {
                
                switch (dataVal) {
                    case 'key-A':
                    case 'key-Bb':
                    case 'key-B':
                    case 'key-C':
                    case 'key-Db':
                    case 'key-D':
                    case 'key-Eb':
                    case 'key-E':
                    case 'key-F':
                    case 'key-Gb':
                    case 'key-G':
                    case 'key-Ab':
                    case 'key-G#':
                    case 'key-A#':
                    case 'key-C#':
                    case 'key-D#':
                    case 'key-F#':
                      
                      this.funcHandleKeyChange(dataVal);
                      

                      break;

                      case 'position-0':
                      case 'position-1':
                      case 'position-2':
                      case 'position-3':
                      case 'position-4':
                      case 'position-5':

                          const position = Number(dataVal.split('-')[1]);

                          this.handlePosition(position);

                          break;

                        
                        default:
                          
                            break;
                            

                  }

              }

            });

          });

        });

      }

      funcChangeTuning() {

        console.log("Chang");

      }

      funcSetupGuitarNeckModifiers() {

        if(this.settings.position) {

          this.guitarNeck.classList.remove('position-0', 'position-1', 'position-2', 'position-3', 'position-4', 'position-5');

          this.guitarNeck.classList.add("position-" + this.settings.position);

        }

      }

      funcHandleKeyChange(val) { 

          console.log('Handling key change...', val);

          this.settings.key = val.split('-')[1];

          this.funcSetupFretboard();

      }

    handlePosition(pos) {
        
        this.settings.position = pos;

        this.funcSetupGuitarNeckModifiers();
        
    }

    funcGetScaleNotes(key, scaleName) {
       
          return funcGetScaleNotesByName(key, scaleName, this.settings.showFlats);

    }

    funcGetScaleIntervals(key, scaleName) {

      return funcGetScaleNotesByName(key, scaleName, this.settings.showFlats, true);

    }

    saveSettings() {

        try {

          const serializedSettings = JSON.stringify(this.settings);

          localStorage.setItem(this.storageKey, serializedSettings);

          return true; // Settings saved successfully

        } catch (error) {

          console.error('Error saving settings:', error);

          return false; // Failed to save settings

        }

      }

      loadSettingsFromStorage() {
        
        try {

          const serializedSettings = localStorage.getItem(this.storageKey);

          if (serializedSettings === null) {

            return null; // No settings found

          }

          return JSON.parse(serializedSettings);

        } catch (error) {

          console.error('Error loading settings:', error);

          return null; // Failed to load settings

        }

      }

    funcClearSettings() { 
            
            localStorage.removeItem(this.storageKey);
    }

      createPassiveSettingsProxy(settings) {

        return new Proxy(settings, {

          set: (target, prop, value) => {

            console.log(`Setting ${prop} to ${value}`);

            target[prop] = value;

            this.saveSettings();

            return true;

          },

        }); 

      }


  }

