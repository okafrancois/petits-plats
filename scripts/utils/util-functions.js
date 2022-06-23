/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Template formatting
  • Trap focus
  • Export
*/
/*
  • Trap focus
  ---------- ---------- ---------- ---------- ----------
*/

function trapFocusIntoModal(modal, previousFocused, customFocusableElements) {
  let focusableItems = modal.querySelectorAll('button, a, video, input, select, textarea');

  // if custom focusable elements are provided, add them to the focusable items
  if(customFocusableElements) {
    focusableItems = [...customFocusableElements];
  }
  const firstFocusableElement = focusableItems[0]; // get first element to be focused inside modal;
  const lastFocusableElement = focusableItems[focusableItems.length - 1];

  // keep focus between first and last focusable elements

  function _onShiftTab(e) {// use private function to be use in removeEventListener on modal close
    let isTabPressed = e.key === 'Tab';

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) { // if shift key pressed for shift + tab combination
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus(); // add focus for the last focusable element
        e.preventDefault();
      }
    } else { // if tab key is pressed
      if (document.activeElement === lastFocusableElement) { // if focused has reached to last focusable element
        firstFocusableElement.focus(); // add focus for the first focusable element
        e.preventDefault();
      } else if(![...focusableItems].includes(document.activeElement)) {// if focus isn't on one of modal focusable elements
        firstFocusableElement.focus(); // add focus for the first focusable element
        e.preventDefault();
      }
    }
  }

  // handle keydown event
  document.on('keydown', _onShiftTab);

  // set focus on focus element before modal open & remove keydown event listener on modal
  modal.on('closed', () => {
    document.removeEventListener('keydown', _onShiftTab);
  });

}

/*
  • Remove duplicates elements in array
  ---------- ---------- ---------- ---------- ----------
*/

function removeDuplicates(array) {
  return [...new Set(array)];
}

/*
  • normalized string
  ---------- ---------- ---------- ---------- ----------
*/

// remove accents, extra spaces from string and lowercase it
function normalizedText(string) {
  return string.trim().normalize('NFD').replace(/([\u0300-\u036f]|[^a-zA-Z\s])/g, '').replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/*
  • Get random number
  ---------- ---------- ---------- ---------- ----------
*/

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
  • Values matching in array
  ---------- ---------- ---------- ---------- ----------
*/

// return true if there is at least one element in array 2 who match one element in array 1
function matchAtLeastOne(array1, array2) {
  let result = false;

  array1.forEach(element => {
    array2.forEach(element2 => {
      if (element2.includes(element)) {
        result = true;
      }
    })
  })

  return result
}

// return an array of items formatted with the provided template
function mapItems(items, template, params = []) {
  return items.map(item => template(item, ...params)).join('\n');
}

/*
  • Export
  ---------- ---------- ---------- ---------- ----------
*/

export {
  trapFocusIntoModal,
  removeDuplicates,
  normalizedText,
  getRandomInt,
  matchAtLeastOne,
  mapItems
};
