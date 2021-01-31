/* eslint-disable quotes */
const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');
const app = require('../src/app');
const { makeRecipesArray } = require('./fixtures/recipes.fixtures');
const { makeIngredientsArray } = require('./fixtures/ingredients.fixtures');

describe('Ingredients Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE ingredients RESTART IDENTITY CASCADE'));
  before('clean the table', () => db.raw('TRUNCATE recipes RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE ingredients RESTART IDENTITY CASCADE'));
  afterEach('cleanup', () => db.raw('TRUNCATE recipes RESTART IDENTITY CASCADE'));

  beforeEach(`insert recipes`, () => {
    const testRecipes = makeRecipesArray();
    return db
      .into('recipes')
      .insert(testRecipes);
  });

  describe(`GET /api/ingredients`, () => {
    context(`Given no ingredients`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/ingredients')
          .expect(200, []);
      });
    });

    context(`Given there are ingredients in the database`, () => {
      const testIngredients = makeIngredientsArray();
      console.log(testIngredients[1]);
      beforeEach(`insert ingredients`, () => {
        return db
          .into('ingredients')
          .insert(testIngredients);
      });

      it(`GET /api/ingredients responds with 200 and all ingredients`, () => {
        return supertest(app)
          .get('/api/ingredients')
          .expect(200, testIngredients);
      });
    });
  });

  describe(`GET /api/ingredients/:ingredient_id`, () => {
    context(`Given no ingredient`, () => {
      it(`responds with 404`, () => {
        const ingredient_id = 123;
        return supertest(app)
          .get(`/api/ingredients/${ingredient_id}`)
          .expect(404, { error: { message: `Ingredient doesn't exist` } });
      });
    });

    context(`Given there are ingredients in the database`, () => {
      const testIngredients = makeIngredientsArray();

      beforeEach('insert ingredients', () => {
        return db
          .into('ingredients')
          .insert(testIngredients);
      });

      it(`GET /api/ingredients/:ingredient_id responds 200 and specified ingredient`, () => {
        const ingredient_id = 2;
        const expectedIngredient = testIngredients[ingredient_id - 1];
        return supertest(app)
          .get(`/api/ingredients/${ingredient_id}`)
          .expect(200, expectedIngredient);
      });
    });
  });

  describe(`POST /api/ingredients`, () => {
    it(`create ingredient, responds with 201 and new ingredient`, () => {
      //this.retries(3);
      const newIngredient = {
        title: 'Test new ingredient',
        label: 'Other',
        content: 'Test content',
        recipe_id: '1',
      };

      return supertest(app)
        .post(`/api/ingredients`)
        .send(newIngredient)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newIngredient.title);
          expect(res.body.label).to.eql(newIngredient.label);
          expect(res.body.content).to.eql(newIngredient.content);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('recipe_id');
          expect(res.headers.location).to.eql(`/api/ingredients/${res.body.id}`);
          const expected = new Date().toLocaleString();
          const actual = new Date(res.body.created_ts).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/ingredients/${postRes.body.id}`)
            .expect(postRes.body) 
        );
    });

    const requiredFields = ['title', 'label', 'content', 'recipe_id'];

    requiredFields.forEach(field => {
      const newIngredient = {
        title: 'Test new ingredient',
        label: 'Dining',
        content: 'Test content',
        recipe_id: '1',
      };

      it(`responds with 400 and error when the '${field}' is missing`, () => {
        delete newIngredient[field];

        return supertest(app)
          .post('/api/ingredients')
          .send(newIngredient)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });
  });

  describe(`DELETE /api/ingredients/:ingredient_id`, () => {
    context(`Given no ingredient`, () => {
      it(`responds with 404`, () => {
        const ingredient_id = 123;

        return supertest(app)
          .delete(`/api/ingredients/${ingredient_id}`)
          .expect(404, { error: { message: `Ingredient doesn't exist` } });
      });
    });

    context(`Given there are ingredients in the database`, () => {
      const testIngredients = makeIngredientsArray();

      beforeEach(`insert ingredients`, () => {
        return db
          .into('ingredients')
          .insert(testIngredients);
      });

      it(`responds with 204 and removes ingredient`, () => {
        const idToRemove = 2;
        const expectedIngredients = testIngredients.filter(ingredient => ingredient.id !== idToRemove);

        return supertest(app)
          .delete(`/api/ingredients/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/ingredients`)
              .expect(expectedIngredients)
          );
      });
    });
  });
});