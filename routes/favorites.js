/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */

'use strict';

const express = require('express');
var knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', (req, res) => {
  knex.select('favorites.id', 'book_id', 'user_id', 'books.created_at',
    'books.updated_at', 'title', 'author', 'genre', 'description', 'cover_url')
  .from('favorites')
  .join('books', 'favorites.book_id', 'books.id')
  .join('users', 'favorites.user_id', 'users.id')
  .then((rows) => {
    //console.log('COOKIE LENGTH: ', req.cookies['/token']);
    if (req.cookies['/token']) {
      const faves = camelizeKeys(rows);
      res.json(faves);
    } else {
      res.status(401);
      res.set('Content-Type', 'text/plain');
      res.send('Unauthorized');
    }

  }).catch((err) => {

    res.status(401).send(err);
  });
});


router.get('/check', (req, res, next) => {
  const idParam = req.query.bookId;
  knex.select('favorites.id').from('favorites')
  .then((rows) => {

    if (req.cookies['/token']) {
      if (rows) {
        if (rows[0].id === parseInt(idParam)) {
          res.status(200).json(true);
        } else {
          res.status(200).json(false);
        }
      } else {
        throw new Error('Record not found.');
      }
    } else {
      res.status(401);
      res.set('Content-Type', 'text/plain');
      res.send('Unauthorized');
    }

  }).catch((err) => {

    res.status(401);
    res.set('Content-Type', 'text/plain');
    res.send('Unauthorized');
  });
});


router.post('/', (req, res) => {
  const newFave = decamelizeKeys(req.body);
  newFave.user_id = 1;

    knex('favorites').insert(newFave).returning(['book_id', 'user_id'])
      .then((row) => {
        if (req.cookies['/token']) {
          if (row) {
            delete row.created_at;
            delete row.updated_at;

            const fave = camelizeKeys(row);
            res.status(200).json(fave[0]);
          } else {
            throw new Error('Record not found.');
          }
        } else {
          res.status(401);
          res.set('Content-Type', 'text/plain');
          res.send('Unauthorized');
        }
    }).catch(err => {

    console.log('POST ERROR: ', err);
    res.status(401).send(err);
  });

});

router.delete('/', (req, res) => {
    const deleteFave = decamelizeKeys(req.body);

  knex('favorites').where('id', deleteFave.book_id).returning(['book_id', 'user_id']).del()
    .then((row) => {
      //console.log('COOKIES: ', req.cookies);
      if (req.cookies['/token']) {
        const fave = camelizeKeys(row);

        if (!Object.keys(fave).length) {
          res.status(404).send({msg: 'There\'s no favorite with an id of ' + req.body.id});
          return;
        }

        delete fave.created_at;
        delete fave.updated_at;

        res.json(fave[0]);
      } else {
        res.status(401);
        res.set('Content-Type', 'text/plain');
        res.send('Unauthorized');
      }
    }).catch(err => {
      console.log('DELETE ERROR: ', err);
      res.status(401).send(err);
  });
});

module.exports = router;
