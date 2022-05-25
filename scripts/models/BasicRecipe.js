class BasicRecipe {
  constructor(data) {
    this.name = data.name;
    this.duration = `${data.time} min`;
    this.ingredients = data.ingredients;
    this.description = data.description;
  }
}

export default BasicRecipe;
