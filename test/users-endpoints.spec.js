/* eslint-disable quotes */
const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray } = require('./fixtures/users.fixtures');

describe('Users Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'));

  describe(`GET /api/users`, () => {
    context(`Given no users`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, []);
      });
    });

    context(`Given there are users in the database`, () => {
      const testUser = makeUsersArray();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUser);
      });

      it('GET /api/users responds with 200 and all users', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, testUser);
      });
    });
  });

  describe(`missing fields /api/users`, () => {
    const requiredFields = ['firstname', 'lastname', 'username', 'password'];
    
    it(`responds with 400 and error when the '${requiredFields[0]}' is missing`, () => {
      const newUser = {
        id: 123,
        firstname: 'test_first',
        lastname: 'test_last',
        username: 'test_user',
        password: 'secret',
      };
      delete newUser[requiredFields[0]];
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {
          error: { message: `Missing '${requiredFields[0]}' in request body` }
        });
    });

    it(`responds with 400 and error when the '${requiredFields[1]}' is missing`, () => {
      const newUser = {
        id: 123,
        firstname: 'test_first',
        lastname: 'test_last',
        username: 'test_user',
        password: 'secret',
      };
      delete newUser[requiredFields[1]];
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {
          error: { message: `Missing '${requiredFields[1]}' in request body` }
        });
    });

    it(`responds with 400 and error when the '${requiredFields[2]}' is missing`, () => {
      const newUser = {
        id: 123,
        firstname: 'test_first',
        lastname: 'test_last',
        username: 'test_user',
        password: 'secret',
      };
      delete newUser[requiredFields[2]];
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {
          error: { message: `Missing '${requiredFields[2]}' in request body` }
        });
    });
  });
});