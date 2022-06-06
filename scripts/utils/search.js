/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Base
*/


function getSearchResults(searchTerm, data) {
    return data.filter(recipe => recipe.name.toLowerCase().includes(searchTerm) || recipe.ingredients.some(item => item.ingredient.toLowerCase().includes(searchTerm)) || recipe.description.toLowerCase().includes(searchTerm));
}


export { getSearchResults };
