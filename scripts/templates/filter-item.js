export function filterItem(item) {
  return `<button id="${item}" class="tag-box__item" data-value="${item}" aria-label="${item}" aria-selected="true">${item}</button>`
}
