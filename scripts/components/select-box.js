import {mapItems, normalizedText, trapFocusIntoModal} from "../utils/util-functions.js";
/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Config
  • Component class
  • Private functions
  • Event Handlers
  • Init & Export
*/

/*
  • Config
  ---------- ---------- ---------- ---------- ----------
*/

const SELECTORS = {
  root: 'select-box',
  trigger: 'select-box__trigger',
  searchInput: 'input[type="search"]',
  itemsContainer: 'select-box__list',
  item: 'select-box__item',
};

const MODIFIERS = {
  isOpen: '--is-open',
  isSelected: '--is-selected',
  isDisabled: '--is-disabled',
}

/*
  • Config
  ---------- ---------- ---------- ---------- ----------
*/

class SelectBox extends HTMLElement {
  constructor() {
    super();
    this.rootElmt = this;
    this.itemsClickHandler = null;
  }

  get trigger() {
    return this.rootElmt.querySelector(`.${SELECTORS.trigger}`);
  }

  get itemsContainer() {
    return this.rootElmt.querySelector(`.${SELECTORS.itemsContainer}`);
  }

  get itemsBlocks() {
    return this.itemsContainer.querySelectorAll(`.${SELECTORS.item}`);
  }

  get searchInput() {
    return this.rootElmt.querySelector(`${SELECTORS.searchInput}`);
  }

  open() {
    this.rootElmt.classList.add(MODIFIERS.isOpen);
    this.trigger.setAttribute('aria-expanded', 'true');
    this.rootElmt.emit('opened');
  }

  close() {
    this.rootElmt.classList.remove(MODIFIERS.isOpen);
    this.trigger.setAttribute('aria-expanded', 'false');
    this.searchInput.value = '';
    this.rootElmt.emit('closed');
  }

  addOptions(items, selectedItems) {
    // add items to the block container
    this.itemsContainer.innerHTML = mapItems(items, selectBoxItem);

    // add disabled class to items that are already selected
    this.itemsBlocks.forEach(item => {
      if (selectedItems.includes(item.dataset.value)) {
        item.classList.add(MODIFIERS.isDisabled);
      }
    })

    this.rootElmt.emit('options-added');
  }

  refreshSelectedOptions(items, selectedItems) {
    console.log('refreshSelectedOptions', items, selectedItems);
    this.itemsBlocks.forEach(item => {
      if (items.includes(item.dataset.value) && !selectedItems.includes(item.dataset.value)) {
        item.classList.remove(MODIFIERS.isDisabled);
      } else {
        item.classList.add(MODIFIERS.isDisabled);
      }
    })
  }

  connectedCallback() {
    this.searchInput.on('input', onSearchInput.bind(this));

    this.rootElmt.on('options-added', () => {
      this.itemsBlocks.forEach(item => {
        item.on('click', this.itemsClickHandler);
      })
    });

    this.trigger.on('click', this.open.bind(this));

    this.rootElmt.on('opened', () => {
      trapFocusIntoModal(this.rootElmt, null);

      //close tag box when escape key is pressed
      document.on('keydown', onEscKeyPress.bind(this));

      // close tag box when clicking outside
      document.on('click', onClickOutside.bind(this));
    });

    this.rootElmt.on('closed', () => {
      document.removeEventListener('keydown', onEscKeyPress.bind(this));
      document.removeEventListener('click', onClickOutside.bind(this));
    })
  }
}

/*
  • Privates functions
  ---------- ---------- ---------- ---------- ----------
*/

function selectBoxItem(value) {
  return `<button id="${value}" class="${SELECTORS.item}" data-value="${value}" aria-label="${value}" aria-selected="true">${value}</button>`
}


/*
  • Event Handlers
  ---------- ---------- ---------- ---------- ----------
*/

function onEscKeyPress(e) {
  if(e.key === "Escape") {
    this.close();
    e.preventDefault();
  }
}

function onClickOutside(e) {
  if(e.target !== this.rootElmt && !this.rootElmt.contains(e.target)) {
    this.close();
  }
}

function onSearchInput(e) {
  const searchValue = normalizedText(e.target.value);
  const items = this.itemsBlocks;

  items.forEach(item => {
    const itemValue = normalizedText(item.dataset.value);
    if (itemValue.includes(searchValue) || searchValue.includes(itemValue)) {
      item.classList.remove(MODIFIERS.isDisabled);
    } else {
      item.classList.add(MODIFIERS.isDisabled);
    }
  })
}

/*
  • Init & Export
  ---------- ---------- ---------- ---------- ----------
*/

function initSelectBoxes() {
  customElements.define('select-box', SelectBox);
}

export default initSelectBoxes;
