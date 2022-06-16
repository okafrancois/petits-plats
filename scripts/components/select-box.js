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
  searchInput: 'select-box__search-input',
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

class SelectBox {
  constructor(root, data) {
    this.root = root;
    this.list = data.list;
    this.selected = data.selected;
    this.searchable = data.searchable;

    this.connectedCallback();
  }

  get trigger() {
    return this.root.querySelector(`.${SELECTORS.trigger}`);
  }

  get itemsContainer() {
    return this.root.querySelector(`.${SELECTORS.itemsContainer}`);
  }

  get itemsBlocks() {
    return this.itemsContainer.querySelectorAll(`.${SELECTORS.item}`);
  }

  get searchInput() {
    return this.root.querySelector(`.${SELECTORS.searchInput}`);
  }

  open() {
    this.root.classList.add(MODIFIERS.isOpen);
    this.trigger.setAttribute('aria-expanded', 'true');
    this.root.emit('opened');
  }

  close() {
    this.root.classList.remove(MODIFIERS.isOpen);
    this.trigger.setAttribute('aria-expanded', 'false');
    this.searchInput.value = '';
    this.root.emit('closed');
  }

  onItemClick(callback) {
    this.itemsBlocks.forEach(item => {
      item.on('click', callback);
    })
  }

  activateSearchField() {
    this.searchInput.on('input', onSearchInput.bind(this));
  }

  renderItems() {
    // add items to the block container
    this.itemsContainer.innerHTML = mapItems(this.list, itemTemplate);

    // add disabled class to items that are already selected
    this.itemsBlocks.forEach(item => {
      if (this.selected.includes(item.dataset.value)) {
        item.classList.add(MODIFIERS.isDisabled);
      }
    })

    this.root.emit('rendered');
  }

  connectedCallback() {
    this.renderItems();

    this.searchInput.on('focus', this.open.bind(this));

    this.root.on('opened', () => {
      trapFocusIntoModal(this.root, null);

      //close tag box when escape key is pressed
      document.on('keydown', onEscKeyPress.bind(this));

      // close tag box when clicking outside
      document.on('click', onClickOutside.bind(this));

      if (this.searchable) {
        this.activateSearchField();
      }
    });

    this.root.on('closed', () => {
      document.removeEventListener('keydown', onEscKeyPress.bind(this));
      document.removeEventListener('click', onClickOutside.bind(this));
    })


  }
}

/*
  • Privates functions
  ---------- ---------- ---------- ---------- ----------
*/

function itemTemplate(value) {
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
  if(e.target !== this.root && !this.root.contains(e.target)) {
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

function initSelectBox(root, data) {
  return new SelectBox(root, data);
}


export {initSelectBox};
