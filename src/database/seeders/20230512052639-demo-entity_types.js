'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.bulkInsert('entity_types', [
			/* {
				value: 'recommended_for',
				label: 'Recommended For',
				data_type: 'character varying',
				allow_filtering: true,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: 1,
				updated_by: 1,
				org_id: 1,
				has_entities: true,
				model_names: ['Session'],
			},
			{
				value: 'categories',
				label: 'Categories',
				data_type: 'character varying',
				allow_filtering: false,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: 1,
				updated_by: 1,
				org_id: 1,
				has_entities: true,
				model_names: ['Session'],
			},
			{
				value: 'age',
				label: 'age',
				data_type: 'integer',
				allow_filtering: false,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: 1,
				updated_by: 1,
				org_id: 1,
				has_entities: false,
				model_names: ['Session'],
			},
			{
				value: 'location',
				label: 'location',
				data_type: 'character varying',
				allow_filtering: false,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: 1,
				updated_by: 1,
				org_id: 1,
				has_entities: false,
				model_names: ['Session'],
			}, */
			{
				value: 'test_rating',
				label: 'Test Rating',
				data_type: 'character varying',
				allow_filtering: false,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: 1,
				updated_by: 1,
				org_id: 1,
				has_entities: false,
				model_names: ['Session', 'SessionAttendee'],
			},
			/* {
				value: 'age',
				label: 'age',
				data_type: 'timestamp',
				allow_filtering: false,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: 1,
				updated_by: 1,
				org_id: 1,
				has_entities: true,
				model_name: ['Session'],
			}, */
			/* {
				value: 'number',
				label: 'Number',
				data_type: 'integer',
				allow_filtering: true,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: 1,
				updated_by: 1,
				org_id: 1,
				has_entities: true,
				model_name: ['Session'],
			},
			{
				value: 'float',
				label: 'Float',
				data_type: 'double precision',
				allow_filtering: true,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: 1,
				updated_by: 1,
				org_id: 1,
				has_entities: true,
				model_name: ['Session'],
			}, */
		]);
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
