const RecipesService = {
  getAllRecipes(db, user) {
    return db('recipes')
      .select('*')
      .where('author_id', user);
  },

  insertRecipe(db, data) {
    return db('recipes')
      .insert(data)
      .returning('*')
      .then(rows => rows[0]);
  },

  getById(db, id) {
    return db('recipes')
      .select('*')
      .where({ id })
      .first();
  },

  deleteRecipe(db, id) {
    return db('recipes')
      .where({ id })
      .delete();
  },

  updateRecipe(db, id, data) {
    return db('recipes')
      .where({ id })
      .update(data);
  }

};

module.exports = RecipesService;