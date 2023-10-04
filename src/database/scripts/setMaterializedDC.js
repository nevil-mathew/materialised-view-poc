'use strict';
const model = require('../models/index');
const { sequelize } = require('../models/index');

const setMaterializedDC = async () => {
	try {
		const queryString = `SELECT create_distributed_table('sessions_m_view', 'v_id');`;
		await sequelize.query(queryString);
	} catch (err) {
		console.log(err);
	}
};

setMaterializedDC();
