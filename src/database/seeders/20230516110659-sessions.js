'use strict';
const { faker } = require('@faker-js/faker');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const totalSessions = 100;
		for (let pass = 0; pass < 15; pass++) {
			console.time('pass-' + pass);
			const sessionsData = [];
			console.time('Data-generation pass-' + pass);
			for (let i = 0; i < totalSessions; i++) {
				const session = {
					title: faker.lorem.words(3),
					description: faker.lorem.sentence(),
					/* recommended_for: generateRandomArrayOfObjects(),
				categories: generateRandomArrayOfObjects(),
				medium: generateRandomArrayOfObjects(), */
					images: generateRandomArray(5),
					mentor_id: faker.number.int(100),
					session_reschedule_count: faker.number.int(100),
					status: faker.helpers.arrayElement(['active', 'inactive']),
					time_zone: faker.location.timeZone(),
					start_date: faker.date.future(),
					end_date: faker.date.future(),
					mentee_password: faker.internet.password(),
					mentor_password: faker.internet.password(),
					started_at: faker.date.past(),
					share_link: faker.internet.url(),
					completed_at: faker.date.past(),
					is_feedback_skipped: faker.datatype.boolean(),
					mentee_feedback_questionset: faker.lorem.words(5),
					mentor_feedback_questionset: faker.lorem.words(5),
					meeting_info: generateRandomObject(),
					meta: generateRandomObject(),
					visibility: faker.helpers.arrayElement(['public', 'private']),
					organisation_ids: generateRandomArray(3),
					mentor_org_id: faker.number.int(100),
					created_at: new Date(),
					updated_at: new Date(),
				};
				sessionsData.push(session);
			}
			console.timeEnd('Data-generation pass-' + pass);
			console.time('bulkInsert pass-' + pass);
			await queryInterface.bulkInsert('sessions', sessionsData, {});
			console.timeEnd('bulkInsert pass-' + pass);
			console.timeEnd('pass-' + pass);
		}
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
	},
};

function generateRandomArrayOfObjects(length = 1) {
	const arr = [];
	for (let i = 0; i < length; i++) {
		/* const obj = {
			entity_type: faker.lorem.words(1),
			entity: faker.number.int(100),
		}; */
		arr.push({
			entity_type: faker.lorem.words(1),
			entity: faker.number.int(100),
		});
	}
	console.log('array of objects: ', arr);
	return JSON.stringify(arr);
}

function generateRandomArray(length = 1) {
	const arr = [];
	for (let i = 0; i < length; i++) {
		arr.push(faker.internet.url());
	}
	return arr;
}

function generateRandomObject() {
	return JSON.stringify({
		age: faker.number.int(50),
		location: faker.location.city(),
		/* avatar: faker.lorem.words(2),
		preference: faker.lorem.words(2),
		boolean: faker.datatype.boolean(),
		number: faker.number.int(100),
		float: faker.number.float({ max: 100 }),
		all: {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			birthDate: faker.date.birthdate(),
			registeredAt: faker.date.past(),
			password: faker.internet.password(),
			avatar: faker.image.avatar(),
		}, */
	});
}
