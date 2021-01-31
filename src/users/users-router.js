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
  // .get((req, res, next) => {
  //   const knexInstance = req.app.get('db');
  //   UsersService.getAllUsers(knexInstance)
  //     .then(users => {
  //       res.json(users.map(serializeUser));
  //     })
  //     .catch(next);
  // })
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

      // await UsersService.populateUserWords(
      //   req.app.get('db'),
      //   user.id
      // )

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${user.id}`))
        .json(serializeUser(user))
    } catch(error) {
      next(error)
    }})

//     newUser.password = password;

//     UsersService.insertUser(
//       req.app.get('db'),
//       newUser
//     )
//       .then(user => {
//         logger.info(`User with id ${user.id} created.`);
//         res
//           .status(201)
//           .location(path.posix.join(req.originalUrl, `/${user.id}`))
//           .json(serializeUser(user));
//       })
//       .catch(next);
//   });

// usersRouter
//   .route('/:user_id')
//   .all((req, res, next) => {
//     UsersService.getById(
//       req.app.get('db'),
//       req.params.user_id
//     )
//       .then(user => {
//         if (!user) {
//           return res.status(404).json({
//             error: { message: `User doesn't exist` }
//           });
//         }
//         res.user = user;
//         next();
//       })
//       .catch(next);
//   })
//   .get((req, res, next) => {
//     res.json(serializeUser(res.user));
//   })
//   .delete((req, res, next) => {
//     UsersService.deleteUser(
//       req.app.get('db'),
//       req.params.user_id
//     )
//       .then(numRowsAffected => {
//         res.status(204).end();
//       })
//       .catch(next);
//   })
//   .patch(jsonParser, (req, res, next) => {
//     const { firstname, lastname, username, password } = req.body;
//     const userToUpdate = { firstname, lastname, username, password };

//     const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
//     if (numberOfValues === 0)
//       return res.status(400).json({
//         error: {
//           message: `Request body must contain either 'firstname', 'lastname', 'username', or 'password'`
//         }
//       });

//     UsersService.updateUser(
//       req.app.get('db'),
//       req.params.user_id,
//       userToUpdate
//     )
//       .then(numRowsAffected => {
//         res.status(204).end();
//       })
//       .catch(next);
//   });

module.exports = usersRouter;