import {recipes} from "../data/recipes.js";
import Recipe from "./models/Recipe.js";
import RecipeCard from "./templates/recipe-card.js";
import {mapItems, matchAtLeastOne, normalizedText, removeDuplicates} from "./utils/util-functions.js";
import tagItem from "./templates/tag-item.js";
import "./components/tag-box.js";
import initSelectBoxes from "./components/select-box.js";

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
      searchTerm: null, ingredients: [], appliance: [], ustensils: []
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
    return document.querySelectorAll(".filters select-box");
  }

  get activeTagsContainer() {
    return document.querySelector(".active-tags__container");
  }

  // change the value off the filter options
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

  // update available filters based on the current search results
  updateAvailableFilters() {
    const filters = {
      ingredients: [],
      appliance: [],
      ustensils: []
    };

    this.searchResults.forEach(recipeId => {
      const recipe = this.recipes.find(recipeItem => recipeItem.id === recipeId);

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

  // perform the search and update the search results
  updateResultData() {
    const isAdvanceFilter = this.activeFilters.ingredients.length > 0 || this.activeFilters.appliance.length > 0 || this.activeFilters.ustensils.length > 0;
    this.searchResults = isAdvanceFilter ? this.getAdvancedSearchResults(this.activeFilters, this.recipes) : this.getBasicSearchResults(this.activeFilters.searchTerm, this.recipes);

    this.updateAvailableFilters();
    this.refreshSearchTermFilter();
    this.reloadContent();
  }

  // update search term filter value
  refreshSearchTermFilter() {
    this.activeFilters.searchTerm = normalizedText(this.searchInput.value);
  }

  // add recipes cards to the recipes container
  displayRecipesCards() {
    // map the current search results to the recipe card template
    // add results recipes to the container after mapping them to the recipe card template
    this.recipesContainer.innerHTML = mapItems(this.recipes.map(recipe => new Recipe(recipe)), RecipeCard)
  }

  // add active tag block to the active tags container
  displayActiveTagBlock(type, value) {
    const activeTagBlock = tagItem(value, type);
    this.activeTagsContainer.innerHTML += activeTagBlock;

    this.activeTagsContainer.emit("new-tag-added")
  }

  // remove tag value from the active filters
  removeActiveTag(filterType, filterValue) {
    // remove the filter option from the active filters
    this.activeFilters[filterType] = this.activeFilters[filterType].filter(item => {
      return item !== filterValue;
    });

    this.updateResultData();
  }

  // remove active tag from the active filters array and the active tags blocks
  onRemoveActiveTagClick(e) {
    e.preventDefault();

    // get the tag block concerned
    const tagBlock = e.target.closest(".active-tags__item");

    // remove the tag block from the active tags container
    this.activeTagsContainer.removeChild(tagBlock);

    // remove tag value from the active filters
    this.removeActiveTag(tagBlock.dataset.type, tagBlock.dataset.value);
  }

  // add filters options blocks to the select box
  addFiltersOptions(filtersBlock) {
    const options = this.availableFilters[filtersBlock.dataset.type];
    const selectedOptions = this.activeFilters[filtersBlock.dataset.type];

    filtersBlock.addOptions(options, selectedOptions);
  }

  // ad the filter value to the active filters array
  onFilterOptionClick(e) {
    e.preventDefault();
    const filterType = e.target.closest(".select-box").dataset.type;
    const filterValue = e.target.dataset.value;

    this.updateActiveFilters(filterType, filterValue);

    this.displayActiveTagBlock(filterType, filterValue);
  }

  // perform a search with the given search term and recipes ids that match the search term
  getBasicSearchResults(searchTerm, data) {
    // if the search term is empty, return all the recipes ids
    if (searchTerm === null || searchTerm === "" || searchTerm.length < 3) {
      return data.map(recipe => recipe.id);
    } else {
      const term = normalizedText(searchTerm);

      // remove all the recipes that don't match the search term from data array
      const filteredResults = data.filter(recipe => {
        const isTitleMatch = normalizedText(recipe.name).includes(term) || term.includes(normalizedText(recipe.name));
        const isIngredientsMatch = matchAtLeastOne([term], recipe.ingredients.map(item => normalizedText(item.ingredient)));
        const isDescriptionMatch = normalizedText(recipe.description).includes(term);

        return isTitleMatch || isIngredientsMatch || isDescriptionMatch;
      })

      // return the recipes ids that match the search term
      return filteredResults.map(recipe => recipe.id);
    }
  }

  // perform a search with the given search term and advanced filters and return the recipes ids that match
  getAdvancedSearchResults(filters, data) {
    let results = data;

    // return recipes who match the search term
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

    this.recipesBlocks.forEach(recipe => {
      const recipeId = parseInt(recipe.dataset.id);

      // add hidden class to recipes item that the id is not in the results list
      if (filters.includes(recipeId)) {
        recipe.classList.remove("--is-hidden");
      } else {
        recipe.classList.add("--is-hidden");
      }
    })

    // if there are no results add empty attribute to display empty message
    if (this.searchResults.length === 0) {
      this.recipesContainer.setAttribute("data-empty", "true");
    } else {
      this.recipesContainer.removeAttribute("data-empty");
    }
  }

  // apply filters to the recipes and fire the filters changes event
  reloadContent() {
    this.applyFilters(this.searchResults);
    this.filterTypesBlock.forEach(filtersBlock => {
      filtersBlock.emit("options-changed");
    })
  }

  init() {
    const selectBoxes = document.querySelectorAll("select-box");
    const searchForm = document.querySelector(".filters");

    // add recipes cards to the page
    this.displayRecipesCards();

    // update search term value
    if (this.searchInput.value.length > 2) {
      this.updateActiveFilters("searchTerm", normalizedText(this.searchInput.value));
    } else {
      this.updateActiveFilters("searchTerm", "");
    }

    initSelectBoxes();

    // add advance filters options to the select boxes
    selectBoxes.forEach(selectBox => {
      selectBox.itemsClickHandler = this.onFilterOptionClick.bind(this);

      this.addFiltersOptions(selectBox);

      selectBox.on("options-changed", () => {
        selectBox.refreshSelectedOptions(this.availableFilters[selectBox.dataset.type], this.activeFilters[selectBox.dataset.type]);
      })
    })

    // update the search term when the user changes it
    this.searchInput.on("input", (e) => {
      const searchTerm = normalizedText(e.target.value);
      this.updateActiveFilters("searchTerm", searchTerm);
    })

    // prevent the form from submitting
    searchForm.addEventListener("submit", e => {
      e.preventDefault();
    })

    // prevent form from submitting when enter is pressed
    this.searchInput.addEventListener("focus", () => {
      const _onEnterPress = (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      }

      document.addEventListener("keydown", _onEnterPress);

      this.searchInput.addEventListener("blur", () => {
        document.removeEventListener("keydown", _onEnterPress);
      })
    });

    // add remove tag event listener to the newly created active tag
    this.activeTagsContainer.on("new-tag-added", () => {
      this.activeTagsContainer.querySelectorAll("button").forEach(button => {
        button.on("click", this.onRemoveActiveTagClick.bind(this));
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
