const RecipeCard = (recipe) => (
  `<li class="recipes__item recipe-card">
                <div class="recipe-card__container" href="#">
                    <div class="recipe-card__cover"></div>
                    <div class="recipe-card__content">
                        <h3 class="recipe-card__title">${recipe.name}</h3>
                        <div class="recipe-card__duration">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="assets/icon-lib.svg#clock"></use>
                            </svg>
                            <span>${recipe.duration}</span>
                        </div>
                        <ul class="recipe-card__ingredients">
                            ${recipe.ingredients
                                .map(ingredient => IngredientItem(ingredient))
                                .join('')}
                        </ul>
                        <div class="recipe-card__description">
                            <p>${recipe.description}</p>
                        </div>
                    </div>
                </div>
            </li>
    `
)

function IngredientItem(ingredient) {
  return `<li>
            <span class="recipe-card__ingredients-name">${ingredient.ingredient}: </span>
            ${ingredient.quantity ? `<span class="recipe-card__ingredients-quantity">${ingredient.quantity} ${ingredient.unit ? ingredient.unit : ''} </span>` : ''}
        </li>`
}

export default RecipeCard
