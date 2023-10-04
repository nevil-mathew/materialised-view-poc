'use strict';
const { sequelize } = require('../models/index');

const refreshMaterializedView = async () => {
	try {
		console.time('REFRESH');
		await sequelize.query('REFRESH MATERIALIZED VIEW sessions_full_m_view;');
		console.timeEnd('REFRESH');
	} catch (err) {
		console.log(err);
	}
};

refreshMaterializedView();
