class Recipe {
  constructor(data) {
    this.name = data.name;
    this.duration = `${data.time} min`;
    this.ingredients = data.ingredients;
    this.description = data.description;
    this.id = data.id;
  }
}

export default Recipe;
