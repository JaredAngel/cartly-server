/* eslint-disable quotes */
const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');
const app = require('../src/app');
const { makeRecipesArray } = require('./fixtures/recipes.fixtures');
const { makeUsersArray } = require('./fixtures/users.fixtures');

describe.only('Recipes Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE recipes RESTART IDENTITY CASCADE'));
  before('clean the table', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'));
  
  beforeEach('make user', () => {
    const testUser = makeUsersArray();
    db('users').insert(testUser[0]);
  });

  afterEach('cleanup', () => db.raw('TRUNCATE recipes RESTART IDENTITY CASCADE'));
  afterEach('cleanup', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'));

  describe(`GET /api/recipes`, () => {
    context(`Given no recipes`, () => {
      it.only(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/recipes')
          .set('Authorization', `Bearer ${process.env.AUTH_TOKEN}`)
          .expect(200, []);
      });
    });

    context(`Given there are recipes in the database`, () => {
      const testRecipes = makeRecipesArray();

      beforeEach('insert recipes', () => {
        return db
          .into('recipes')
          .insert(testRecipes);
      });

      it('GET /api/recipes responds with 200 and all recipes', () => {
        return supertest(app)
          .get('/api/recipes')
          .expect(200, testRecipes);
      });
    });
  });

  describe(`GET /api/recipes/:recipe_id`, () => {
    context(`Given no recipes`, () => {
      it(`responds with 404`, () => {
        const recipe_id = 123;
        return supertest(app)
          .get(`/api/recipes/${recipe_id}`)
          .expect(404, { error: { message: `Recipe doesn't exist` } });
      });
    });

    context(`Given there are recipes in the database`, () => {
      const testRecipes = makeRecipesArray();

      beforeEach('insert recipes', () => {
        return db
          .into('recipes')
          .insert(testRecipes);
      });

      it(`GET /api/recipes/:recipe_id responds 200 and specified recipe`, () => {
        const recipe_id = 2;
        const expectedRecipe = testRecipes[recipe_id - 1];
        return supertest(app)
          .get(`/api/recipes/${recipe_id}`)
          .expect(200, expectedRecipe);
      });
    });
  });

  describe(`POST /api/recipes`, () => {
    it(`create recipe, responds with 201 and new recipe`, () => {
      //this.retries(3);
      const newRecipe = {
        title: 'Test new recipe',
      };

      return supertest(app)
        .post(`/api/recipes`)
        .send(newRecipe)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newRecipe.title);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/recipes/${res.body.id}`);
          const expected = new Date().toLocaleString();
          const actual = new Date(res.body.created_ts).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/recipes/${postRes.body.id}`)
            .expect(postRes.body) 
        );
    });

    const requiredFields = ['title'];

    requiredFields.forEach(field => {
      const newRecipe = {
        title: 'Test new recipe',
      };

      it(`responds with 400 and error when the '${field}' is missing`, () => {
        delete newRecipe[field];

        return supertest(app)
          .post('/api/recipes')
          .send(newRecipe)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });
  });

  describe(`DELETE /api/recipes/:recipe_id`, () => {
    context(`Given no recipe`, () => {
      it(`responds with 404`, () => {
        const recipe_id = 123;

        return supertest(app)
          .delete(`/api/recipes/${recipe_id}`)
          .expect(404, { error: { message: `Recipe doesn't exist` } });
      });
    });

    context(`Given there are recipes in the database`, () => {
      const testRecipes = makeRecipesArray();

      beforeEach(`insert recipes`, () => {
        return db
          .into('recipes')
          .insert(testRecipes);
      });

      it(`responds with 204 and removes recipe`, () => {
        const idToRemove = 2;
        const expectedRecipes = testRecipes.filter(recipe => recipe.id !== idToRemove);

        return supertest(app)
          .delete(`/api/recipes/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/recipes`)
              .expect(expectedRecipes)
          );
      });
    });
  });
});