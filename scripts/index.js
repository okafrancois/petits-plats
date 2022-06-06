import {recipes} from "../data/recipes.js";
import BasicRecipe from "./models/BasicRecipe.js";
import RecipeCard from "./templates/RecipeCard.js";
import {getSearchResults} from "./utils/search.js";

/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Base
*/

class App {
    constructor(data) {
        
        this.recipes = data;
        this.currentSearchTerm = "";
        this.currentSearchResults = [...this.recipes];
    }

    get recipesContainer() {
        return document.querySelector(".recipes");
    }

    renderRecipes(data) {
        this.recipesContainer.innerHTML = "";

        data = data || this.recipes;
        data
            .map(recipe => new BasicRecipe(recipe))
            .forEach(recipe => {
                const template = RecipeCard(recipe);
                this.recipesContainer.innerHTML += template;
            });
    }

    updateSearchResults(searchTerm) {
        this.currentSearchTerm = searchTerm;
        this.currentSearchResults = getSearchResults(searchTerm, this.recipes);

        this.renderRecipes(this.currentSearchResults);
    }

    init() {
        const searchInput = document.querySelector(".filters .search__bar");

        this.renderRecipes(this.recipes);

        searchInput.addEventListener("change", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.updateSearchResults(searchTerm);
        })

    }
}

const app = new App(recipes);
app.init();
