/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Template formatting
  • Trap focus
  • Export
*/

/*
  • Template formatting
  ---------- ---------- ---------- ---------- ----------
*/

function formatTemplate(template, data) {
    const objectsProperties = Object.entries(data);

    // replace all the placeholders in the template by correspondants values of the object properties
    objectsProperties.forEach(property => {
        const [key, value] = property;
        template = template.replaceAll(`{${key}}`, value);
    });

    // return formatted template with received data
    return template;
}

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

    // remove previous listener to ensure double listening
    removeEventListener('keydown', _onShiftTab)

    // handle keydown event
    document.addEventListener('keydown', _onShiftTab);

    // set focus on focus element before modal open & remove keydown event listener on modal
    modal.addEventListener('closed', () => {
        if (previousFocused) {
            previousFocused.focus()
        }

        document.removeEventListener('keydown', _onShiftTab);
    });

}

/*
  • Remove duplicates elements in array
  ---------- ---------- ---------- ---------- ----------
*/

// remove duplicates elements in array
function removeDuplicates(array) {
    return [...new Set(array)];
}

/*
  • Export
  ---------- ---------- ---------- ---------- ----------
*/

export { trapFocusIntoModal, formatTemplate, removeDuplicates };
