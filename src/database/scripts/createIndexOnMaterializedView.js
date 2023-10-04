'use strict';
const { sequelize } = require('../models/index');

async function createIndexOnMaterializedView() {
	try {
		await sequelize.query('CREATE INDEX id_index_half ON sessions_m_view (v_id);');
		console.log('Index created successfully!');
	} catch (error) {
		console.error('Error creating index:', error);
	} finally {
		await sequelize.close();
	}
}

createIndexOnMaterializedView();
