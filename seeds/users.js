var users = [{
  id: 1,
  first_name: 'Joanne',
  last_name: 'Rowling',
  email: 'jkrowling@gmail.com',
  hashed_password: '$2a$12$C9AYYmcLVGYlGoO4vSZTPud9ArJwbGRsJ6TUsNULzR48z8fOnTXbS',  // youreawizard
  created_at: new Date('2016-06-29 14:26:16 UTC'),
  updated_at: new Date('2016-06-29 14:26:16 UTC')
}];

exports.seed = function(knex, Promise) {
	var userPromises = [];

	for (var index in users) {
    	userPromises.push(knex('users').insert(users[index]));
  }
    // Delete all, then run the updates
    return knex('users').del().then(function() {
        return Promise.all(userPromises);
  	});
};
