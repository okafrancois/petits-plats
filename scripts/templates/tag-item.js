const tagItem = (tag, type) => {
  return `<li class="active-tags__item --${type}" data-type="${type}" data-value="${tag}">
                    <span>${tag}</span>
                    <button class="active-tags__remove">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="assets/icon-lib.svg#remove"></use>
                        </svg>
                    </button>
                </li>`
}


export default tagItem;
