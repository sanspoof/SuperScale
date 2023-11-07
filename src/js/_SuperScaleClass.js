import * as scaleData from './data.json';

export class SuperScaleApp {

    constructor() {

      this.scales = scaleData.Scales;
      this.guitarNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      this.observer = null;
      this.funcReturnMutation = this.funcReturnMutation.bind(this);
      this.storageKey = 'superScaleSettings';
      this.defaults = { scale:"minor", position:0, key:"C" };

      this.settings = this.loadSettingsFromStorage() || {}; 
      this.settings = this.createPassiveSettingsProxy(this.settings);
      this.settings.scale = this.settings.scale || this.defaults.scale;
        this.settings.position = this.settings.position || this.defaults.position;
        this.settings.key = this.settings.key || this.defaults.key;


        this.string1 = document.querySelector('[data-string="1"]');
        this.string2 = document.querySelector('[data-string="2"]');
        this.string3 = document.querySelector('[data-string="3"]');
        this.string4 = document.querySelector('[data-string="4"]');
        this.string5 = document.querySelector('[data-string="5"]');
        this.string6 = document.querySelector('[data-string="6"]');
        this.nutstring1 = document.querySelector('[data-nutstring="1"]');
        this.nutstring2 = document.querySelector('[data-nutstring="2"]');
        this.nutstring3 = document.querySelector('[data-nutstring="3"]');
        this.nutstring4 = document.querySelector('[data-nutstring="4"]');
        this.nutstring5 = document.querySelector('[data-nutstring="5"]');
        this.nutstring6 = document.querySelector('[data-nutstring="6"]');
        
    }

    init() {

        this.funcSetupFretboard();
        this.funcSetupControls();   
        this.funcObserveNut(); 
        this.funcSetupNotesDisplay(this.settings.key, this.settings.scale);
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

    }

    funcDisconnectNutObserver() {
    
        this.observer.disconnect();
        
    }

    addFretAndNote(stringElement, startNote) {

        let stringNumber = stringElement.dataset.string;

        const templateGuitarFret = document.querySelector('#guitarfret');

        let el = this[`string${stringNumber}`];

        el.innerHTML = '';

        for (let i = 1; i <= 12; i++) {

          const el = templateGuitarFret.content.cloneNode(true);

          const fretElement = el.querySelector('[data-fret]');

          const noteElement = el.querySelector('[data-note]');
      
          fretElement.setAttribute('data-fret', i);

          noteElement.setAttribute('data-note', startNote);

          noteElement.textContent = startNote;
      
          stringElement.appendChild(el);

          startNote = this.getNextNote(startNote, this.guitarNotes);

        }

        this.funcSetNutMarkup();

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
       
    }

    funcSetupNotesDisplay(key, scale) {

        const elements = document.querySelectorAll('[data-note]');

        elements.forEach(el => { 
            el.classList.remove('guitar__note--active', 'guitar__note--root');
        });

        const notes = this.funcGetScaleNotes(key,scale);
        
        notes.forEach(note => {

            const elements = document.querySelectorAll(`[data-note="${note}"]`);

            elements.forEach(el => {

              el.classList.add('guitar__note--active');

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

      getNextNote(currentNote, guitarNotes ) {
       
        const index = guitarNotes.indexOf(currentNote);
      
        const nextIndex = (index + 1) % guitarNotes.length;

        return guitarNotes[nextIndex];

      }
  
    funcSetupControls() {
        
        const controls = document.querySelectorAll('[data-role="switcher"]');
        const selectElement = document.querySelector('[data-role="switcher-select"]');

        if (selectElement) { 

            selectElement.addEventListener('change', (event) => {

              const selectedOption = event.target.selectedOptions[0];

              const dataVal = selectedOption.value;
        
                console.log(dataVal);

                if (dataVal) {

                    this.settings.scale = dataVal;

                    this.funcSetupNotesDisplay(this.settings.key, this.settings.scale);
                    
                  }

            });

          }

        controls.forEach(control => {

          const toggleButtons = control.querySelectorAll('[data-val]');
    
          toggleButtons.forEach(button => {

            button.addEventListener('click', () => {

                button.parentNode.querySelectorAll('[data-val]').forEach(button => { 

                    button.classList.remove('active');

                });

                button.classList.add('active');

              const dataVal = button.getAttribute('data-val');

              if (dataVal) {
                
                switch (dataVal) {

                    case 'intervals':

                      this.handleIntervals();
                      
                      break;

                    case 'notes':

                      this.handleNotes();

                      break;

                    case 'position-all':

                        this.handlePosition(0);
    
                        break;

                    case 'position-1':
                            
                            this.handlePosition(1);
        
                            break;

                    case 'position-2':

                            this.handlePosition(2);

                            break;

                    case 'position-3':

                            this.handlePosition(3);


                            break;

                    case 'position-4':
                            
                                this.handlePosition(4);
    
                                break;

                    case 'position-5':

                            this.handlePosition(5);

                            break;
                            

                  }

              }

            });

          });

        });

      }

      handleIntervals() {
     
        console.log('Handling intervals...');
   
      }

      handleNotes() {
       
        console.log('Handling notes...');
        
      }

    handlePosition(pos) {
        
        console.log('Handling position...', pos);
        
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

            target[prop] = value;

            this.saveSettings();

            return true;

          },

        });

      }


  }

