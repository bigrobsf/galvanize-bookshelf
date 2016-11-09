/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */

'use strict';

const express = require('express');
var knex = require('../knex');
const { camelizeKeys } = require('humps');
const { decamelizeKeys } = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', (req, res) => {
  knex('books').orderBy('title').then((rows) => {
    const books = camelizeKeys(rows);
    res.json(books);
  }).catch((err) => {
    
    res.status(400).send(err);
  });
});

router.get('/:id', (req, res) => {
  knex('books').where('id', req.params.id).then((row) => {
    const book = camelizeKeys(row);
    res.json(book[0]);
  }).catch((err) => {

    res.status(400).send(err);
  });
});

router.post('/', (req, res) => {
  const newBook = decamelizeKeys(req.body);

  knex('books').insert(newBook).returning(['title', 'author', 'genre', 'description', 'cover_url'])
    .then((row) => {
      const book = camelizeKeys(row);

      res.json(book[0]);
    }).catch(err => {
      console.log('POST ERROR: ', err);
      res.status(400).send(err);
    });
});

router.patch('/:id', (req, res) => {
  const updateBook = decamelizeKeys(req.body);

  knex('books').where('id', req.params.id).update(updateBook).returning('*')
    .then((row) => {
    const book = camelizeKeys(row);

    if (!Object.keys(book).length) {
      res.status(404).send({msg: 'There\'s no book with an id of ' + req.params.id});
      return;
    }

    res.json(book[0]);
  }).catch(err => {
    res.status(400).send(err);
  });
});

router.delete('/:id', (req, res) => {
  knex('books').where('id', req.params.id).returning(['title', 'author', 'genre', 'description', 'cover_url']).del()
    .then((row) => {
      const book = camelizeKeys(row);

      if (!Object.keys(book).length) {
        res.status(404).send({msg: 'There\'s no book with an id of ' + req.params.id});
        return;
      }

      res.json(book[0]);
    }).catch(err => {
      res.status(400).send(err);
  });
});


module.exports = router;
