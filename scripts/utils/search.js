/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Base
*/


function getSearchResults(searchTerm, data) {
    const results = [];

    data.forEach(recipe => {
        const recipeName = recipe.name.toLowerCase();
        const nameTest = recipeName.includes(searchTerm);
        const ingredientsTest = recipe.ingredients.some(item => item.ingredient.toLowerCase().includes(searchTerm));
        const descriptionTest = recipe.description.toLowerCase().includes(searchTerm);

        if (nameTest || ingredientsTest || descriptionTest) {
            results.push(recipe);
        }
    });

    return results;
}


export { getSearchResults };
