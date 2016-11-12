/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
'use strict';

const boom  = require('boom');
const express = require('express');
const bcrypt = require('bcrypt-as-promised');
var knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

// =============================================================================
// GET without token
router.get('/', (req, res, next) => {
  if (req.cookies['/token'] === 'cookie.monster.rawr') {
    res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
});

// =============================================================================
// POST token and check for bad email and bad password
router.post('/', (req, res, next) => {
  const authReq = decamelizeKeys(req.body);
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return next(boom.create(400, 'Email must not be blank'));
  }

  if (!password || password.length < 8) {
    return next(boom.create(400, 'Password must not be blank'));
  }

  let user;

  knex('users').where('email', authReq.email).first()
    .then((row) => {
      if (!row) {
        return next(boom.create(400, 'Bad email or password'));
      }

      user = camelizeKeys(row);
      return bcrypt.compare(authReq.password, user.hashedPassword);
    })
    .then(() => {
      delete user.hashedPassword;
      delete user.createdAt;
      delete user.updatedAt;

      res.cookie('/token', 'cookie.monster.rawr', { path: '/', httpOnly: true });

      res.json(user);
    })
    .catch(bcrypt.MISMATCH_ERROR, () => {
      throw boom.create(400, 'Bad email or password');
    })
    .catch(err => {
      next(err);
    });
});


// =============================================================================
// DELETE token
router.delete('/', (req, res) => {
  res.clearCookie('/token', { path: '/', httpOnly: true });
  res.status(200).json(true);
});

module.exports = router;
