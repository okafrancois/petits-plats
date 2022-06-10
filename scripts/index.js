import {recipes} from "../data/recipes.js";
import Recipe from "./models/Recipe.js";
import RecipeCard from "./templates/recipe-card.js";
import TagBox from "./utils/tag-box.js";
import {filterItem} from "./templates/filter-item.js";
import {matchAtLeastOne, normalizedText, removeDuplicates} from "./utils/util-functions.js";
import tagItem from "./templates/tag-item.js";

// dev purpose
console.clear();

/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Base
*/

class App {
  constructor(data) {
    this._recipes = data;
    this.searchResults = [...this._recipes];
    this.availableFilters = {
    };
    this.activeFilters = {
      searchTerm: null,
      ingredients: [],
      appliance: [],
      ustensils: []
    };
  }

  get recipesContainer() {
    return document.querySelector(".recipes");
  }

  get searchInput() {
    return document.querySelector(".filters .search__bar input");
  }

  get filterTypesBlock() {
    return document.querySelectorAll(".filters .options__select");
  }

  get activeTagsContainer() {
    return document.querySelector(".active-tags__container");
  }

  updateActiveFilters(filterType, filterValue) {
    if (filterType === "searchTerm") {
      this.activeFilters.searchTerm = filterValue;
      this.updateResultData();
      return;
    }

    if (!this.activeFilters[filterType].includes(filterValue)) {
        this.activeFilters[filterType].push(filterValue);
      this.updateResultData();
    }
  }

  removeActiveTag(filterType, filterValue) {
    // remove the filter option from the active filters
    this.activeFilters[filterType] = this.activeFilters[filterType].filter(item => {
        return item !== filterValue;
    });

    this.updateResultData();
  }

  updateAvailableFilters() {
    const filters = {
      ingredients: [],
      appliance: [],
      ustensils: []
    };

    this.searchResults.forEach(recipe => {
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

  updateResultData() {
    if (this.activeFilters.ingredients.length > 0 || this.activeFilters.appliance.length > 0 || this.activeFilters.ustensils.length > 0) {
      this.searchResults = this.getAdvancedSearchResults(this.activeFilters, this._recipes);
    } else {
      this.searchResults = this.getSearchResults(this.activeFilters.searchTerm, this._recipes);
    }

    this.updateAvailableFilters();
    this.refreshActiveFilters();
    this.reloadContent();
  }

  refreshActiveFilters() {
    this.activeFilters.searchTerm = normalizedText(this.searchInput.value);
  }

  displayRecipesCards() {
    // clear the container before rendering the new cards
    this.recipesContainer.innerHTML = "";

    // display custom message if no results
    if (this.searchResults.length === 0) {
      this.recipesContainer.innerHTML = `<p class="no-results">Aucune recette ne correspond à votre critère... vous pouvez
chercher « tarte aux pommes », « poisson », etc.</p>`;

      return;
    }

    // map the current search results to the recipe card template
    // add results recipes to the container after mapping them to the recipe card template
    this.searchResults
      .map(recipe => new Recipe(recipe))
      .forEach(recipe => {
        const template = RecipeCard(recipe);
        this.recipesContainer.innerHTML += template;
      });
  }

  displayActiveTags() {
    const tagsContainer = this.activeTagsContainer;

    tagsContainer.innerHTML = "";

    if (this.activeFilters.ingredients.length > 0) {
      tagsContainer.innerHTML += this.activeFilters.ingredients.map(item => tagItem(item, 'ingredients')).join("\n")
    }

    if (this.activeFilters.appliance.length > 0) {
      tagsContainer.innerHTML += this.activeFilters.appliance.map(item => tagItem(item, 'appliance')).join("\n");
    }

    if (this.activeFilters.ustensils.length > 0) {
      tagsContainer.innerHTML += this.activeFilters.ustensils.map(item => tagItem(item, 'ustensils')).join("\n");
    }

    tagsContainer.querySelectorAll(".active-tags__remove").forEach(tag => {
      tag.addEventListener("click", this.onTagClick.bind(this));}
    )
  }

  onTagClick(e) {
    const tagBlock = e.target.closest(".active-tags__item");

    const filterType = tagBlock.dataset.type;
    const filterValue = tagBlock.dataset.value;

    this.removeActiveTag(filterType, filterValue);
  }

  displayFiltersType() {
    // init select box for each filter type
    this.filterTypesBlock.forEach(filter => {
      new TagBox(filter);
    })
  }

  displayFiltersOptions() {

    this.filterTypesBlock.forEach(filter => {
      // get the container of the filter options
      const optionsBlock = filter.querySelector("[role='listbox']");

      // clear the container before rendering the new options
      optionsBlock.innerHTML = "";

      // get the data that corresponds to the filter type in the available filters & map them to the filter option template
      const options = this.availableFilters[filter.dataset.type].map(item => filterItem(item));

      // add options to the container
      optionsBlock.innerHTML = options.join("\n");


      // add event listener to each option
      optionsBlock.querySelectorAll("button").forEach(option => {
        option.removeEventListener("click", this.onFilterOptionClick.bind(this));
        option.addEventListener("click", this.onFilterOptionClick.bind(this));
      })
    })
  }

  onFilterOptionClick(e) {
    e.preventDefault();
    const filterType = e.target.closest(".options__select").dataset.type;
    const filterValue = e.target.dataset.value;

    this.updateActiveFilters(filterType, filterValue);
  }

  getSearchResults(searchTerm, data) {
    if (searchTerm === null || searchTerm === "") {
      return data;
    }

    const term = normalizedText(searchTerm);

    // remove recipes whose name, ingredients and description content do not match the search term
    return  data.filter(recipe => {
      const titleTest = normalizedText(recipe.name).includes(term) || term.includes(normalizedText(recipe.name));
      const ingredientsTest = matchAtLeastOne([term], recipe.ingredients.map(item => normalizedText(item.ingredient)));
      const descriptionTest = normalizedText(recipe.description).includes(term);

      return titleTest || ingredientsTest || descriptionTest;
    });
  }

  getAdvancedSearchResults(filters, data) {
    let results = data;

    // remove recipes that don't match the search term
    if (filters.searchTerm !== null && filters.searchTerm !== "") {
        results = this.getSearchResults(filters.searchTerm, results);
    }

    // remove recipes that don't match active ingredients list
    if (filters.ingredients.length > 0) {
        results = results.filter(recipe => {
            return matchAtLeastOne(filters.ingredients.map(item => normalizedText(item)), recipe.ingredients.map(item => normalizedText(item.ingredient)));
        });
    }

    // remove recipes that don't match active appliance list
    if (filters.appliance.length > 0) {
        results = results.filter(recipe => {
            return filters.appliance.some(item => item === normalizedText(recipe.appliance));
        })
    }

    // remove recipes that don't match active ustensils list
    if (filters.ustensils.length > 0) {
        results = results.filter(recipe => {
            return matchAtLeastOne(filters.ustensils.map(item => normalizedText(item)), recipe.ustensils.map(item => normalizedText(item)));
        })
    }

    return results;
  }

  reloadContent() {
    this.displayRecipesCards();
    this.displayActiveTags();
    this.displayFiltersType();
    this.displayFiltersOptions();
  }

  init() {
    if (this.searchInput.value.length > 2) {
      this.updateActiveFilters("searchTerm", normalizedText(this.searchInput.value));
    } else {
      this.updateResultData();
      this.reloadContent();
    }

    this.searchInput.addEventListener("input", (e) => {
      const searchTerm = normalizedText(e.target.value.toLowerCase());
      if (searchTerm.length > 2) {
        this.updateActiveFilters("searchTerm", searchTerm);
      }
    })
  }
}

const app = new App(recipes);
app.init();
