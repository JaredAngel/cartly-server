const IngredientsService = {
  getAllIngredients(db, user) {
    return db('ingredients')
      .select('*')
      .where('author_id', user);

  },

  insertIngredient(db, data) {
    return db('ingredients')
      .insert(data)
      .returning('*')
      .then(rows => rows[0]);
  },

  getById(db, id) {
    return db('ingredients')
      .select('*')
      .where({ id })
      .first();
  },

  deleteIngredient(db, id) {
    return db('ingredients')
      .where({ id })
      .delete();
  },

  updateIngredient(db, id, data) {
    return db('ingredients')
      .where({ id })
      .update(data);
  }

};

module.exports = IngredientsService;