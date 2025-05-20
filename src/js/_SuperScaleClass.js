import * as scaleData from './data.json';

export class SuperScaleApp {

    constructor() {

      this.scales = scaleData.Scales;
      this.guitarNotes = scaleData.GuitarNotes.notes;
      this.ChordFormulas = scaleData.ChordFormulas;
      this.guitarNeck = document.querySelector('#Guitar');
      this.observer = null;
      this.funcReturnMutation = this.funcReturnMutation.bind(this);
      this.storageKey = 'superScaleSettings';
      this.defaults = { 
        scale:"minor", 
        position:0, 
        key:"C", 
        showAllNotes:"true",
        display:"notes", 
        tuning:{ 1:"E", 2:"B", 3:"G", 4:"D", 5:"A", 6:"E" } 
      };

      this.settings = this.loadSettingsFromStorage() || {}; 
      this.settings = this.createPassiveSettingsProxy(this.settings);
      this.settings.scale = this.settings.scale || this.defaults.scale;
        this.settings.position = this.settings.position || this.defaults.position;
        this.settings.showAllNotes = this.settings.showAllNotes || this.defaults.showAllNotes;
        this.settings.key = this.settings.key || this.defaults.key;
        this.settings.display = this.settings.display || this.defaults.display;
        this.settings.tuning = this.settings.tuning || this.defaults.tuning;

        this.strings = Array.from({ length: 6 }, (_, i) => i + 1);

        this.nutstrings = Array.from({ length: 6 }, (_, i) => i + 1);
    
        this.strings.forEach((num) => {

          this[`string${num}`] = document.querySelector(`[data-string="${num}"]`);

          this[`nutstring${num}`] = document.querySelector(`[data-nutstring="${num}"]`);

        });
        
    }

    init() { 
      
        this.scales = scaleData.Scales;
        this.funcSetupFretboard();
        this.funcSetupControls();  
        this.funcObserveNut(); 
        this.functionGetTriadNotesFromScale();
    }

    destroy() {
        this.scales = null;
    }


    // Need to make sharps and Flats appear in the same box....


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

    funcHighlightMatchingNotes() { 

      const elements = document.querySelectorAll('[data-note]');

      elements.forEach(el => {

        el.addEventListener('mouseover', () => { 

          const dataNoteValues = el.getAttribute('data-note').split(':');

          dataNoteValues.forEach(note => {

            const elements = document.querySelectorAll('[data-note]');

            elements.forEach(el => {

              const dataNoteValues = el.getAttribute('data-note').split(':');

              if (dataNoteValues.includes(note)) {

                el.classList.add('guitar__note--matchinghover');

              }

            });

          });

        });

        el.addEventListener('mouseout', () => { 
            
            const dataNoteValues = el.getAttribute('data-note').split(':');
  
            dataNoteValues.forEach(note => {
  
              const elements = document.querySelectorAll('[data-note]');
  
              elements.forEach(el => {
  
                const dataNoteValues = el.getAttribute('data-note').split(':');
  
                if (dataNoteValues.includes(note)) {
  
                  el.classList.remove('guitar__note--matchinghover');
  
                }
  
              });
  
            });
        });
        

       });

    }

    funcFindCommonNotes() {

      const allNotes = this.guitarNotes;

      const selectedNotes = this.funcGetScaleNotes(this.settings.key, this.settings.scale);
      
      // Flatten the nested array structure
      const flattenedNotes = allNotes.flat();
      
      const commonNotes = flattenedNotes.filter(note => selectedNotes.includes(note));
      
      // console.log("All Notes", allNotes);

      // console.log("Notes in common", commonNotes);

      // console.log("Selected Notes", selectedNotes);

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

        this.funcSetupNotesDisplay(this.settings.key, this.settings.scale);
 
        this.settings.tuning[el.dataset.nutstring] = newValue;
        
        this.saveSettings();

    } 

    funcDisconnectNutObserver() {
    
        this.observer.disconnect();
        
    }

    funcSetRootNoteModifier(key) {

      let strModifier = "guitar__note--root";

      let currentKey = key;

      let allNotes = this.guitarNeck.querySelectorAll("[data-note]");

      allNotes.forEach( (n) => {

        if(n.dataset.note == currentKey) {
          
          n.classList.add(strModifier); 

        }

      });

    }

    addFretAndNote(stringElement, startNote) {

        let stringNumber = stringElement.dataset.string;

        let startingNutNote = startNote;

        const templateGuitarFret = document.querySelector('#guitarfret');

        let el = this[`string${stringNumber}`];

        el.innerHTML = '';

        for (let i = 1; i <= 12; i++) {

          const el = templateGuitarFret.content.cloneNode(true);

          const fretElement = el.querySelector('[data-fret]');

          const noteElement = el.querySelector('[data-note]');
      
          fretElement.setAttribute('data-fret', i);

          if(Array.isArray(startingNutNote)) { 

              const combinedNotes = startingNutNote.join(':');

              noteElement.setAttribute('data-note', combinedNotes);

              noteElement.textContent = combinedNotes.split(':').join('/');

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

        for(let i = 1; i <= 6; i++) { 

            this.addFretAndNote(this[`string${i}`], this.funcSetTuningBasedOnNutNote(this[`nutstring${i}`].dataset.nutnote));

        }

        this.funcSetupNotesDisplay(this.settings.key, this.settings.scale);
        
        this.guitarNeck.classList.add("position-" + this.settings.position);

        this.funcHighlightMatchingNotes();

        this.funcSetRootNoteModifier(this.settings.key); 

    }

    funcSetupNotesDisplay(key, scale) {

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

      notes.forEach(note => {
        
        const elements = document.querySelectorAll('[data-note]');
      
        elements.forEach(el => {

          const dataNoteValues = el.getAttribute('data-note').split(':');
          
          if (dataNoteValues.includes(note)) {

            el.classList.add('guitar__note--active');

          }

        });

      });
          
    }

    funcGetScaleNotes(key, scaleName) {
       
        if (key in this.scales && scaleName in this.scales[key]) {

          return this.scales[key][scaleName];

        } else {

          return "Invalid key or scale name.";

        }

      }

      functionGetTriadNotesFromScale() {

        let currentScale = this.funcGetScaleNotes(this.settings.key, this.settings.scale);

        let formula = this.ChordFormulas.major; // major triad
      
        const arrTriadNotes = formula.map(degree => currentScale[degree - 1]);
      
        console.log(arrTriadNotes);

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

        const radioShowAllNotes = document.querySelector('input[name="notes"][value="all"]');

        const radioShowScaleNotesOnly = document.querySelector('input[name="notes"][value="scaleonly"]');
      

        let selectedScale = this.settings.scale;

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
        
                console.log(dataVal);

                if (dataVal) {

                    this.settings.scale = dataVal;

                    this.funcSetupNotesDisplay(this.settings.key, this.settings.scale);
                    
                    this.funcSetRootNoteModifier(this.settings.key);
                    
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

        controls.forEach(control => {

          const toggleButtons = control.querySelectorAll('[data-val]');
    
          toggleButtons.forEach(button => { 

            let keyValue = button.dataset.val;

            console.log(keyValue)

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
                      
                      this.funcHandleKeyChange(dataVal);

                      break;

                    case 'intervals':

                      this.handleIntervals();
                      
                      break;

                    case 'notes':

                      this.handleNotes();

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

      handleIntervals() {
     
        console.log('Handling intervals...');

        this.settings.display = 'intervals';
   
      }

      handleNotes() {
       
        console.log('Handling notes...');

        this.settings.display = 'notes';
        
      }

    handlePosition(pos) {
        
        this.settings.position = pos;

        this.funcSetupGuitarNeckModifiers();
        
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

