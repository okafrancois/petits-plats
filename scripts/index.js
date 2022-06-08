import {recipes} from "../data/recipes.js";
import BasicRecipe from "./models/BasicRecipe.js";
import RecipeCard from "./templates/RecipeCard.js";
import SelectBox from "./utils/select-box.js";
import {filterOption} from "./templates/filter-option.js";
import {removeDuplicates} from "./utils/util-functions.js";

/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Base
*/

class App {
    constructor(data) {
        this.recipes = data;
        this.currentSearchResults = [...this.recipes];
        this.availableFilters = {};
    }

    get recipesContainer() {
        return document.querySelector(".recipes");
    }

    get searchInput() {
        return document.querySelector(".filters .search__bar");
    }
    get filterTypesBlock() {
        return document.querySelectorAll(".filters .options__select");
    }

    // reload all the data

    updateAvailableFilters() {
        const filters = {
            ingredients: [],
            appliance: [],
            ustensils: []
        };

        this.currentSearchResults.forEach(recipe => {
            const ingredients = recipe.ingredients.map(item => item.ingredient.toLowerCase());
            const appliance = recipe.appliance.toLowerCase();
            const ustensils = recipe.ustensils.map(item => item.toLowerCase());

            filters.ingredients.push(...ingredients);
            filters.appliance.push(appliance);
            filters.ustensils.push(...ustensils);
        });

        filters.ingredients = removeDuplicates(filters.ingredients);
        filters.appliance = removeDuplicates(filters.appliance);
        filters.ustensils = removeDuplicates(filters.ustensils);

        this.availableFilters = filters;
    }

    renderRecipesCards() {
        // clear the container before rendering the new cards
        this.recipesContainer.innerHTML = "";

        // display custom message if no results
        if (this.currentSearchResults.length === 0) {
            this.recipesContainer.innerHTML = `<p class="no-results">Aucune recette ne correspond à votre critère... vous pouvez
chercher « tarte aux pommes », « poisson », etc.</p>`;

            return;
        }

        // map the current search results to the recipe card template
        // add results recipes to the container after mapping them to the recipe card template
        this.currentSearchResults
            .map(recipe => new BasicRecipe(recipe))
            .forEach(recipe => {
                const template = RecipeCard(recipe);
                this.recipesContainer.innerHTML += template;
            });
    };

    renderFiltersType() {
        // init select box for each filter type
        this.filterTypesBlock.forEach(filter => {
            new SelectBox(filter);
        })
    }

    renderFiltersOptions() {
        this.filterTypesBlock.forEach(filter => {
            // get the container of the filter options
            const optionsBlock = filter.querySelector("[role='listbox']");

            // clear the container before rendering the new options
            optionsBlock.innerHTML = "";

            // get the data that corresponds to the filter type in the available filters & map them to the filter option template
            const options = this.availableFilters[filter.dataset.type].map(item => filterOption(item));

            // add options to the container
            optionsBlock.innerHTML = options.join("");
        })
    }

    getSearchResults(searchTerm, data) {
        return data.filter(recipe => recipe.name.toLowerCase().includes(searchTerm) || recipe.ingredients.some(item => item.ingredient.toLowerCase().includes(searchTerm)) || recipe.description.toLowerCase().includes(searchTerm));
    }

    updateResultData(searchTerm) {
        this.currentSearchResults = this.getSearchResults(searchTerm, this.recipes);
        this.renderRecipesCards();
        this.updateAvailableFilters();
        this.renderResultsData();
    }

    renderResultsData() {
        this.renderRecipesCards(this.currentSearchResults);
        this.filterTypesBlock.forEach(filter => {
            this.renderFiltersOptions(filter, this.availableFilters[filter.dataset.type]);
        })
    }

    init() {
        this.renderRecipesCards(this.currentSearchResults);

        this.searchInput.addEventListener("change", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.updateResultData(searchTerm);
        })

        this.updateAvailableFilters();

        this.renderFiltersType();
        this.renderFiltersOptions();
    }
}

const app = new App(recipes);
app.init();
