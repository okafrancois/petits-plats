export function filterOption(item) {
    return `<button id="${item}" class="select-box__option" data-value="${item}" aria-label="${item}" aria-selected="true">${item}</button>`
}
