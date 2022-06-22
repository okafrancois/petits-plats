import {recipes} from "../data/recipes.js";
import Recipe from "./models/Recipe.js";
import RecipeCard from "./templates/recipe-card.js";
import {mapItems, matchAtLeastOne, normalizedText, removeDuplicates} from "./utils/util-functions.js";
import tagItem from "./templates/tag-item.js";
import "./components/tag-box.js";
import {initSelectBox} from "./components/select-box.js";

/*
  Index
  ---------- ---------- ---------- ---------- ----------
  • Config
  • Component class
  • Init & Export
*/

/*
 • Config
 ---------- ---------- ---------- ---------- ----------
 */

// dev purpose
console.clear();

// add custom emit method
Object.prototype.emit = function(eventName, data) {
  this.dispatchEvent(new CustomEvent(eventName, {
    detail: data
  }));
}

// add custom listen method
Object.prototype.on = function(eventName, callback) {
  this.removeEventListener(eventName, callback);
  this.addEventListener(eventName, callback);
}

/*
 • Component class
 ---------- ---------- ---------- ---------- ----------
 */

class App {
  constructor(data) {
    this.recipes = data;
    this.searchResults = [this.recipes.map(recipe => recipe.id)];
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

  get recipesBlocks() {
    return this.recipesContainer.querySelectorAll(".recipes__item");
  }

  get searchInput() {
    return document.querySelector(".filters .search__bar input");
  }

  get filterTypesBlock() {
    return document.querySelectorAll(".filters .select-box");
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

    this.searchResults.forEach(recipeId => {
      const recipe = this.recipes.find(recipeItem => recipeItem.id === recipeId);

      const ingredients = recipe.ingredients.map(item => normalizedText(item.ingredient));
      const appliance = normalizedText(recipe.appliance);
      const ustensils = recipe.ustensils.map(item => normalizedText(item));

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
    const isAdvanceFilter = this.activeFilters.ingredients.length > 0 || this.activeFilters.appliance.length > 0 || this.activeFilters.ustensils.length > 0;
    this.searchResults = isAdvanceFilter ? this.getAdvancedSearchResults(this.activeFilters, this.recipes) : this.getBasicSearchResults(this.activeFilters.searchTerm, this.recipes);

    this.updateAvailableFilters();
    this.refreshActiveFilters();
    this.reloadContent();
  }

  refreshActiveFilters() {
    this.activeFilters.searchTerm = normalizedText(this.searchInput.value);
  }

  displayRecipesCards() {
    // map the current search results to the recipe card template
    // add results recipes to the container after mapping them to the recipe card template
    this.recipesContainer.innerHTML = mapItems(this.recipes.map(recipe => new Recipe(recipe)), RecipeCard)
  }

  displayActiveTagBlock(type, value) {
    const activeTagBlock = tagItem(value, type);
    this.activeTagsContainer.innerHTML += activeTagBlock;

    this.activeTagsContainer.emit("new-tag-added")
  }

  onActiveTagClick(e) {
    e.preventDefault();

    // get the tag block concerned
    const tagBlock = e.target.closest(".active-tags__item");

    // remove the tag block from the active tags container
    this.activeTagsContainer.removeChild(tagBlock);

    // remove tag value from the active filters
    this.removeActiveTag(tagBlock.dataset.type, tagBlock.dataset.value);
  }

  initAdvancedFilters() {
    // init select box for each filter type
    this.filterTypesBlock.forEach(filter => {
      // get the data that corresponds to the filter type in the available filters & map them to the filter option template
      const options = this.availableFilters[filter.dataset.type]

      const filterBox = initSelectBox(filter, {
        list: options,
        selected: this.activeFilters[filter.dataset.type],
        searchable: true,
      });

      filterBox.onItemClick(this.onFilterOptionClick.bind(this));
    })
  }

  onFilterOptionClick(e) {
    e.preventDefault();
    const filterType = e.target.closest(".select-box").dataset.type;
    const filterValue = e.target.dataset.value;

    e.target.classList.toggle("--selected");

    this.updateActiveFilters(filterType, filterValue);
    this.displayActiveTagBlock(filterType, filterValue);
  }

  // perform a search with the given search term and recipes ids that match the search term
  getBasicSearchResults(searchTerm, data) {
    if (searchTerm === null || searchTerm === "" || searchTerm.length < 3) {
      return data.map(recipe => recipe.id);
    }

    const results = [];

    const term = normalizedText(searchTerm);

    // remove recipes whose name, ingredients and description content do not match the search term
    data.forEach(recipe => {
      const titleTest = normalizedText(recipe.name).includes(term) || term.includes(normalizedText(recipe.name));
      const ingredientsTest = matchAtLeastOne([term], recipe.ingredients.map(item => normalizedText(item.ingredient)));
      const descriptionTest = normalizedText(recipe.description).includes(term);

      if (titleTest || ingredientsTest || descriptionTest) {
        results.push(recipe.id);
      }
    });

    return results;
  }

  // perform a search with the given search term and advanced filters and return the recipes ids that match
  getAdvancedSearchResults(filters, data) {
    let results = data;

    // remove recipes that don't match the search term
    if (filters.searchTerm !== null && filters.searchTerm !== "") {
      const basicSearchResult = this.getBasicSearchResults(filters.searchTerm, results);

      results = basicSearchResult.map(recipeId => results.find(recipe => recipe.id === recipeId));
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

    return results.map(recipe => recipe.id);
  }

  // add or remove hidden class to recipe card depending on search results
  applyFilters(filters) {
    this.displayRecipesCards();

    // display custom message if no results
    if (this.searchResults.length === 0) {
      this.recipesContainer.innerHTML = `<p class="no-results">Aucune recette ne correspond à votre critère... vous pouvez
chercher « tarte aux pommes », « poisson », etc.</p>`;

      return;
    }

    this.recipesBlocks.forEach(recipe => {
      const recipeId = parseInt(recipe.dataset.id);

      // add hidden class to recipes item that the id is not in the results list
      if (filters.includes(recipeId)) {
        recipe.classList.remove("--is-hidden");
      } else {
        recipe.classList.add("--is-hidden");
      }
    })
  }


  reloadContent() {
    this.applyFilters(this.searchResults);
    this.initAdvancedFilters();
  }

  init() {
    this.displayRecipesCards();

    if (this.searchInput.value.length > 2) {
      this.updateActiveFilters("searchTerm", normalizedText(this.searchInput.value));
    } else {
      this.updateActiveFilters("searchTerm", "");
    }

    this.searchInput.on("input", (e) => {
      const searchTerm = normalizedText(e.target.value);
      this.updateActiveFilters("searchTerm", searchTerm);
    })

    this.activeTagsContainer.on("new-tag-added", () => {
      this.activeTagsContainer.querySelectorAll("button").forEach(button => {
        button.on("click", this.onActiveTagClick.bind(this));
      })
    })
  }
}

/*
 • Init
 ---------- ---------- ---------- ---------- ----------
 */

const app = new App(recipes);
app.init();
