import { computePosition, offset, flip, shift, autoUpdate } from '@floating-ui/dom';

export default function initMenu() { 
    const button = document.querySelector('#menuButton');
    const menu = document.querySelector('#superscaleMenu');
    let cleanupAutoUpdate = null;

function openMenu() {

  menu.style.display = 'flex';

  // Auto-update position 
  cleanupAutoUpdate = autoUpdate(button, menu, () => {

    computePosition(button, menu, {

      placement: 'bottom-start',

      middleware: [

        offset(8), // small gap

        flip(),

        shift({ padding: 0 }),

      ],

    }).then(({ x, y }) => {

      Object.assign(menu.style, {

        left: `${x}px`,

        top: `${y}px`,

      });

    });

  });

}

function closeMenu() {

  menu.style.display = 'none';

  if (cleanupAutoUpdate) {

    cleanupAutoUpdate();

    cleanupAutoUpdate = null;

  }

}

button.addEventListener('click', () => {

  if (menu.style.display === 'block') {

    closeMenu();

  } else {

    openMenu();

  }

});

menu.addEventListener('click', (e) => {

    closeMenu();

});

    document.addEventListener('click', (e) => {

    if (!menu.contains(e.target) && e.target !== button) {

        closeMenu();

    }

    });
}

