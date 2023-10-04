'use strict';
const model = require('../models/index');
const { sequelize } = require('../models/index');

const refreshMaterializedView = async () => {
	try {
		const filteringTypes = await model.EntityType.findAll({
			where: {
				allow_filtering: true,
			},
		});
		const queryString = `CREATE MATERIALIZED VIEW sessions_m_view AS
        SELECT 
            (id)::integer as v_id,
            ${await filteringTypes
				.map((data) => {
					return `(meta->>'${data.value}')::${data.type} as v_${data.value}`;
				})
				.join(',\n')}
        FROM public."sessions";`;
		//console.log(queryString);
		console.time('Half-View-Generation');
		await sequelize.query(queryString);
		console.timeEnd('Half-View-Generation');
		/* console.time('REFRESH');
		await sequelize.query('REFRESH MATERIALIZED VIEW materialized_view_dyna6;');
		console.timeEnd('REFRESH'); */
	} catch (err) {
		console.log(err);
	}
};

refreshMaterializedView();
