/* eslint-disable quotes */
const path = require('path');
const express = require('express');
const xss = require('xss');
const UsersService = require('./users-service');
const logger = require('../middleware/logger');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = user => ({
  id: user.id,
  firstname: xss(user.firstname),
  lastname: xss(user.lastname),
  username: xss(user.username),
  created_ts: user.created_ts,
});

usersRouter
  .route('/')
  .get((req, res, next) => {
    const serializeUser2 = user => ({
      id: user.id,
      firstname: xss(user.firstname),
      lastname: xss(user.lastname),
      username: xss(user.username),
      created_ts: user.created_ts,
      password: xss(user.password)
    });

    const knexInstance = req.app.get('db');
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(serializeUser2));
      })
      .catch(next);
  })
  .post(jsonParser, async (req, res, next) => {
    const { firstname, lastname, username, password } = req.body;
    const newUser = { firstname, lastname, username };

    for (const [key, value] of Object.entries(newUser)) {
      if (!value) {
        logger.error(`${key} is required`);
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    try {
      const passwordError = UsersService.validatePassword(password)

      if (passwordError) {
        return res.status(400).json({ error: passwordError })
      }

      const hasUserWithUserName = await UsersService.hasUserWithUserName(
        req.app.get('db'),
        username
      )

      if (hasUserWithUserName)
        return res.status(400).json({ error: `Username already taken` })

      const hashedPassword = await  UsersService.hashPassword(password)

      const newUser = {
        firstname,
        lastname,
        username,
        password: hashedPassword,
      }

      const user = await UsersService.insertUser(
        req.app.get('db'),
        newUser
      )

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${user.id}`))
        .json(serializeUser(user))
    } catch(error) {
      next(error)
    }})

module.exports = usersRouter;