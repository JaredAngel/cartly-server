/* eslint-disable quotes */
const path = require('path');
const express = require('express');
const xss = require('xss');
const RecipesService = require('./recipes-service');
const logger = require('../middleware/logger');
const {requireAuth} = require('../middleware/jwt-auth');

const recipesRouter = express.Router();
const jsonParser = express.json();

const serializeRecipe = recipe => ({
  id: recipe.id,
  title: xss(recipe.title),
  created_ts: recipe.created_ts,
});

recipesRouter
  .use(requireAuth)
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    console.log(req.user);
    RecipesService.getAllRecipes(knexInstance, req.user.id)
      .then(recipes => {
        res.json(recipes.map(serializeRecipe));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const newRecipe = { title };

    for(const [key, value] of Object.entries(newRecipe)) {
      if(!value) {
        logger.error(`${key} is required`);
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    newRecipe['author_id'] = req.user.id;
    RecipesService.insertRecipe(
      req.app.get('db'),
      newRecipe
    )
      .then(recipe => {
        logger.info(`Recipe with id ${recipe.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
          .json(serializeRecipe(recipe));
      })
      .catch(next);
  });

recipesRouter
  .route('/:recipe_id')
  .all((req, res, next) => {
    RecipesService.getById(
      req.app.get('db'),
      req.params.recipe_id
    )
      .then(recipe => {
        if(!recipe) {
          return res.status(404)
            .json({
              error: { message: `Recipe doesn't exist` }
            });
        }
        res.recipe = recipe; // save the Recipe
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeRecipe(res.recipe));
  })
  .delete((req, res, next) => {
    RecipesService.deleteRecipe(
      req.app.get('db'),
      req.params.recipe_id
    )
      .then(() => {
        res
          .status(204)
          .end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const recipeToUpdate = { title };

    const numberOfValues = Object.values(recipeToUpdate)
      .filter(Boolean).length;
    if(numberOfValues === 0) {
      return res
        .status(400)
        .json({
          error: { message: `Request body must contain 'title'`}
        });
    }

    RecipesService.updateRecipe(
      req.app.get('db'),
      req.params.recipe_id,
      recipeToUpdate
    )
      .then(numRowsAffected => {
        res
          .status(204)
          .end();
      })
      .catch(next);
  });

module.exports = recipesRouter;