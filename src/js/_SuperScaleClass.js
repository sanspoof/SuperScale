import * as scaleData from './data.json';

export class SuperScaleApp {

    constructor() {

      this.scales = scaleData.Scales;
      this.guitarNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
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
        
        
        this.setupFretsAndNotesForStandardTuning();
        this.setupControls();    

    }

    addFretAndNote(stringElement, startNote) {

        const templateGuitarFret = document.querySelector('#guitarfret');
      
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

      }

    setupFretsAndNotesForStandardTuning() {
        this.addFretAndNote(this.string1, 'F');
        this.addFretAndNote(this.string2, 'C');
        this.addFretAndNote(this.string3, 'G#');
        this.addFretAndNote(this.string4, 'D#');
        this.addFretAndNote(this.string5, 'A#');
        this.addFretAndNote(this.string6, 'F');
    }

    setupNut() {

        this.nutstring1.innerHTML = 'E';

    }

    changeTuning() { 

        console.log("change tuning");

      }

      getNextNote(currentNote, guitarNotes ) {
       
        const index = guitarNotes.indexOf(currentNote);
      
        const nextIndex = (index + 1) % guitarNotes.length;

        return guitarNotes[nextIndex];

      }
  
    setupControls() {
        
        const controls = document.querySelectorAll('[data-role="switcher"]');
        const selectElement = document.querySelector('[data-role="switcher-select"]');

        if (selectElement) { 

            selectElement.addEventListener('change', (event) => {

              const selectedOption = event.target.selectedOptions[0];

              const dataVal = selectedOption.value;
        
                console.log(dataVal);

            //   if (dataVal) {

            //     switch (dataVal) {

            //       case '':

            //      

            //         break;

            //     }
            //   }

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

                        this.handlePosition();
    
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

        handlePosition() {
         
            console.log('Handling position...');
            
        }

  }

