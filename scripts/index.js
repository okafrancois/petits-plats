import {recipes} from "../data/recipes.js";
import BasicRecipe from "./models/BasicRecipe.js";
import RecipeCard from "./templates/RecipeCard.js";

/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Base
*/

const recipesContainer = document.querySelector(".recipes");

function getRecipes() {
    return recipes;
}

const recipesData = getRecipes();

recipesData
    .map(recipe => new BasicRecipe(recipe))
    .forEach(recipe => {
        const template = RecipeCard(recipe);
        recipesContainer.innerHTML += template;
    });

