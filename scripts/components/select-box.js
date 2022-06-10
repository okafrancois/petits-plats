/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Config
  • Component class
  • Private functions
  • Event Handlers
  • Init & Export
*/

const SELECTORS = {
    root: 'select-box',
    trigger: 'select-box__trigger',
    itemContainer: 'select-box__list',
    item: 'select-box__item',
};

const MODIFIERS = {
    isOpen: '--is-open',
    isSelected: '--is-selected',
    isDisabled: '--is-disabled',
}

class SelectBox {
    constructor(root) {
        this.root = root;
        this.list = [];
    }

    get trigger() {
        return this.root.querySelector(`.${SELECTORS.trigger}`);
    }

    get itemContainer() {
        return this.root.querySelector(`.${SELECTORS.itemContainer}`);
    }

    get itemsBlocks() {
        return this.itemContainer.querySelectorAll(`.${SELECTORS.item}`);
    }

    open() {
        this.root.classList.add(MODIFIERS.isOpen);
        this.trigger.setAttribute('aria-expanded', 'true');
        this.root.emit('opened');
    }

    close() {
        this.root.classList.remove(MODIFIERS.isOpen);
        this.trigger.setAttribute('aria-expanded', 'false');
        this.root.emit('closed');
    }
}


export default SelectBox;
