'use strict';
const model = require('../models/index');
const { sequelize } = require('../models/index');

const enableCitusExtension = async () => {
	try {
		const queryString = `CREATE EXTENSION IF NOT EXISTS citus;`;
		await sequelize.query(queryString);
	} catch (err) {
		console.log(err);
	}
};

enableCitusExtension();
