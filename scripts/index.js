import {recipes} from "../data/recipes.js";
import BasicRecipe from "./models/BasicRecipe.js";
import RecipeCard from "./templates/RecipeCard.js";

/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Base
*/

class App {
    constructor(data) {
        
        this.recipes = data;
    }

    get recipesContainer() {
        return document.querySelector(".recipes");
    }

    renderRecipes(data) {
        data = data || this.recipes;
        data
            .map(recipe => new BasicRecipe(recipe))
            .forEach(recipe => {
                const template = RecipeCard(recipe);
                this.recipesContainer.innerHTML += template;
            });
    }

    init() {
        this.renderRecipes(this.recipes);
    }
}

const app = new App(recipes);
app.init();
