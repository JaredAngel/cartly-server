/* eslint-disable quotes */
const path = require('path');
const express = require('express');
const xss = require('xss');
const IngredientsService = require('./ingredients-service');
const logger = require('../middleware/logger');
const {requireAuth} = require('../middleware/jwt-auth');

const ingredientsRouter = express.Router();
const jsonParser = express.json();

const serializeIngredient = ingredient => ({
  id: ingredient.id,
  title: xss(ingredient.title),
  label: xss(ingredient.label),
  content: xss(ingredient.content),
  created_ts: ingredient.created_ts,
  recipe_id: ingredient.recipe_id,
});

ingredientsRouter
  .use(requireAuth)
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    IngredientsService.getAllIngredients(knexInstance, req.user.id)
      .then(ingredients => {
        res.json(ingredients.map(serializeIngredient));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, label, recipe_id } = req.body;
    const newIngredient = { title, content, label, recipe_id };

    for(const [key, value] of Object.entries(newIngredient)) {
      if(!value) {
        logger.error(`${key} is required`);
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    newIngredient['author_id'] = req.user.id;
    IngredientsService.insertIngredient(
      req.app.get('db'),
      newIngredient
    )
      .then(ingredient => {
        logger.info(`Ingredient with id ${ingredient.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${ingredient.id}`))
          .json(serializeIngredient(ingredient));
      })
      .catch(next);
  });

ingredientsRouter
  .route('/:ingredient_id')
  .all((req, res, next) => {
    IngredientsService.getById(
      req.app.get('db'),
      req.params.ingredient_id
    )
      .then(ingredient => {
        if (!ingredient) {
          return res.status(404).json({
            error: { message: `Ingredient doesn't exist` }
          });
        }
        res.ingredient = ingredient; // save the Ingredient
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeIngredient(res.ingredient));
  })
  .delete((req, res, next) => {
    IngredientsService.deleteIngredient(
      req.app.get('db'),
      req.params.ingredient_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content, label } = req.body;
    const ingredientToUpdate = { title, content, label };

    const numberOfValues = Object.values(ingredientToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title', 'content', or 'label'`
        }
      });

    IngredientsService.updateIngredient(
      req.app.get('db'),
      req.params.ingredient_id,
      ingredientToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = ingredientsRouter;