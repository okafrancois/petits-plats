import {trapFocusIntoModal} from "./util-functions.js";

class SelectBox {
    constructor(selectBox) {
        this.selectBox = selectBox;
        this.selectBoxOptions = selectBox.querySelectorAll('.select-box__option');
        this.selectBoxTrigger = selectBox.querySelector('.select-box__trigger input');
        this.selectBoxValue = selectBox.querySelector('.select-box__value');

        // Open select box on click on trigger
        this.selectBoxTrigger.addEventListener('click', this.openSelectBox.bind(this));

        // update select box value when clicking on an option
        this.selectBoxOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.updateSelectBoxValue.bind(this)(e.target);
            })
        })

        // close select box when clicking outside of it
        document.addEventListener('click', (e) => {
            if(e.target !== this.selectBox && !this.selectBox.contains(e.target)) {
                this.closeSelectBox.bind(this)();
            }
        })

        // close select box when it's value is changed
        this.selectBox.addEventListener('changed', this.closeSelectBox.bind(this));

        this.selectBox.addEventListener('opened', () => {
            // trap focus inside select box when it's opened
            trapFocusIntoModal(this.selectBox, document.activeElement);

            //close select box when escape key is pressed
            document.addEventListener('keydown', this.onEscKeyPress.bind(this));
        })

        this.selectBox.addEventListener('closed', () => {
            document.removeEventListener('keydown', this.onEscKeyPress.bind(this));
        })

    }

    openSelectBox() {
        this.selectBox.classList.add('--is-open');
        this.selectBoxTrigger.setAttribute('aria-expanded', 'true');
        this.selectBox.dispatchEvent(new Event('opened'));
    }

    closeSelectBox() {
        this.selectBox.classList.remove('--is-open');
        this.selectBoxTrigger.setAttribute('aria-expanded', 'false');
        this.selectBox.dispatchEvent(new Event('closed'));
    }

    onEscKeyPress(e) {
        if(e.key === "Escape") {
            this.closeSelectBox();
            e.preventDefault();
        }
    }
}

export default SelectBox;
