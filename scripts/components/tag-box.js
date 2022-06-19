import {trapFocusIntoModal} from "../utils/util-functions.js";

/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Config
  • Component class
  • Init & Export
*/

/*
 • Config
 ---------- ---------- ---------- ---------- ----------
 */

/*
 • Component class
 ---------- ---------- ---------- ---------- ----------
 */
class TagBox {
  constructor(tagBoxRoot) {
    this.root = tagBoxRoot;

    // Open tag box on click on trigger
    this.tagBoxTrigger.on('click', this.openTagBox.bind(this));

    // close tag box when clicking outside of it
    /**document.on('click', (e) => {
      if(e.target !== this.root && !this.root.contains(e.target)) {
        this.closeTagBox.bind(this)();
      }
    })**/

    this.root.on('opened', () => {
      // trap focus inside tag box when it's opened
      trapFocusIntoModal(this.root, null);

      //close tag box when escape key is pressed
      document.on('keydown', this.onEscKeyPress.bind(this));
    })

    this.root.on('closed', () => {
      document.removeEventListener('keydown', this.onEscKeyPress.bind(this));
    })
  }

  get tagBoxTrigger() {
    return this.root.querySelector('.tag-box__trigger input')
  }

  openTagBox() {
    this.root.classList.add('--is-open');
    this.tagBoxTrigger.setAttribute('aria-expanded', 'true');
    this.root.emit('opened');
  }

  closeTagBox() {
    this.root.classList.remove('--is-open');
    this.tagBoxTrigger.setAttribute('aria-expanded', 'false');
    this.root.emit('closed');
  }

  onEscKeyPress(e) {
    if(e.key === "Escape") {
      this.closeTagBox();
      e.preventDefault();
    }
  }
}


/*
 • Init & Export
 ---------- ---------- ---------- ---------- ----------
 */

export default TagBox;
