const model = require('@database/models/index');
const { sequelize, Sequelize } = require('../models/index');

const getMetaRow = async (where) => {
	try {
		if (where.filter && Object.keys(where.filter).length !== 0) {
			const filter = JSON.parse(JSON.stringify(where.filter));
			delete where.filter;
			const whereClause = `WHERE ${Object.keys(where).map((key) => {
				return `t."${key}" = '${where[key]}' AND `;
			})} ${Object.keys(filter).map((key, idx) => {
				if (idx != Object.keys(filter).length - 1) {
					return `v.v_${key} = ${filter[key]} AND `;
				} else return `v.v_${key} = ${filter[key]};`;
			})}`;
			const rows = await sequelize.query(
				`
            SELECT * FROM public."Meta" t 
            JOIN materialized_view_dyna v ON t.id = v.v_id
            ${whereClause}`,
				{
					type: Sequelize.QueryTypes.SELECT,
				}
			);
			return rows;
		} else {
			delete where.filter;
			const row = await model.Meta.findAll({
				where,
			});
			return row;
		}
	} catch (err) {
		console.log(err);
	}
};

exports.metaQueries = {
	getMetaRow,
};
