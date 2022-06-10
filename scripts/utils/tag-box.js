import {trapFocusIntoModal} from "./util-functions.js";

class TagBox {
  constructor(tagBoxRoot) {
    this.root = tagBoxRoot;

    // Open tag box on click on trigger
    this.tagBoxTrigger.addEventListener('click', this.openTagBox.bind(this));

    // close tag box when clicking outside of it
    document.addEventListener('click', (e) => {
      if(e.target !== this.root && !this.root.contains(e.target)) {
        this.closeTagBox.bind(this)();
      }
    })

    this.root.addEventListener('opened', () => {
      // trap focus inside tag box when it's opened
      trapFocusIntoModal(this.root, null);

      //close tag box when escape key is pressed
      document.addEventListener('keydown', this.onEscKeyPress.bind(this));
    })

    this.root.addEventListener('closed', () => {
      document.removeEventListener('keydown', this.onEscKeyPress.bind(this));
    })

  }

  get tagBoxTrigger() {
    return this.root.querySelector('.tag-box__trigger input')
  }

  openTagBox() {
    this.root.classList.add('--is-open');
    this.tagBoxTrigger.setAttribute('aria-expanded', 'true');
    this.root.dispatchEvent(new Event('opened'));
  }

  closeTagBox() {
    this.root.classList.remove('--is-open');
    this.tagBoxTrigger.setAttribute('aria-expanded', 'false');
    this.root.dispatchEvent(new Event('closed'));
  }

  onEscKeyPress(e) {
    if(e.key === "Escape") {
      this.closeTagBox();
      e.preventDefault();
    }
  }
}

export default TagBox;
