'use strict';
const { faker } = require('@faker-js/faker');

exports.generateMetaRows = (count) => {
	let rows = [];
	for (let i = 0; i < count; i++) {
		rows.push({
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			createdAt: new Date(),
			updatedAt: new Date(),
			meta: JSON.stringify({
				float: faker.number.float({ max: 100 }),
				number: faker.number.int(100),
				birthDate: faker.date.birthdate(),
				registeredAt: faker.date.past(),
				password: faker.internet.password(),
				avatar: faker.image.avatar(),
				test: 'test string',
				all: {
					firstName: faker.person.firstName(),
					lastName: faker.person.lastName(),
					email: faker.internet.email(),
					birthDate: faker.date.birthdate(),
					registeredAt: faker.date.past(),
					password: faker.internet.password(),
					avatar: faker.image.avatar(),
				},
			}),
		});
	}
	return rows;
};
