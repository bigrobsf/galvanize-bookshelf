/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
'use strict';

const express = require('express');
var knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const { camelizeKeys, decamelizeKeys } = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/', (req, res) => {

  console.log('NEW USER: ', req.body);
  const password = req.body.password;

  bcrypt.hash(password, 12)
    .then((hashed) => {

      let newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        hashedPassword: hashed
      };

      return knex('users')
        .insert(decamelizeKeys(newUser), ['id', 'first_name', 'last_name', 'email']);
    })
    .then((row) => {
      const user = camelizeKeys(row[0]);

      delete user.createdAt;
      delete user.updatedAt;
      delete user.hashedPassword;

      console.log('RESPONDING WITH: ', user);

      res.json(user);
    }).catch(err => {
      console.log('POST ERROR: ', err);
      res.status(400).send(err);
    });
});

module.exports = router;
