var favorites = [{
  id: 1,
  book_id: 1,
  user_id: 1,
  created_at: new Date('2016-06-29 14:26:16 UTC'),
  updated_at: new Date('2016-06-29 14:26:16 UTC')
}];

exports.seed = function(knex, Promise) {
	var userPromises = [];
  userPromises.push(knex('favorites').insert(favorites[0]));

  // Delete all, then run the updates
  return knex('favorites').del().then(function() {
      return Promise.all(userPromises);
	});
};
