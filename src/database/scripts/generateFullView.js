'use strict';
const { fi } = require('@faker-js/faker');
const model = require('../models/index');
const { sequelize } = require('../models/index');

const typeModifier = (fields) => {
	//console.log(fields.length);
	const outputArray = [];
	for (let i = 0; i < fields.length; i++) {
		if (fields[i].type === 'ARRAY') {
			if (fields[i].subField === 'JSON') {
				outputArray.push({
					key: fields[i].key,
					type: 'json[]',
				});
			} else if (fields[i].subField === 'STRING') {
				outputArray.push({
					key: fields[i].key,
					type: 'character varying[]',
				});
			}
		} else if (fields[i].type === 'INTEGER') {
			outputArray.push({
				key: fields[i].key,
				type: 'integer',
			});
		} else if (fields[i].type === 'DATE') {
			if (fields[i].key !== 'createdAt' && fields[i].key !== 'updatedAt')
				outputArray.push({
					key: fields[i].key,
					type: 'timestamp with time zone',
				});
		} else if (fields[i].type === 'BOOLEAN') {
			outputArray.push({
				key: fields[i].key,
				type: 'boolean',
			});
		} else if (fields[i].type === 'JSONB') {
		} else if (fields[i].type === 'JSON') {
			outputArray.push({
				key: fields[i].key,
				type: 'json',
			});
		} else if (fields[i].type === 'STRING') {
			outputArray.push({
				key: fields[i].key,
				type: 'character varying',
			});
		}
	}
	return outputArray;
};

const generateFullView = async () => {
	try {
		const filteringTypes = await model.EntityType.findAll({
			where: {
				allow_filtering: true,
			},
		});
		const oneSessionRow = await model.Session.findOne({});
		//console.log(oneSessionRow._options.attributes);
		const columns = [];
		for (let key in model.Session.rawAttributes) {
			columns.push({
				key: key,
				type: model.Session.rawAttributes[key].type.key,
				subField: model.Session.rawAttributes[key].type.options?.type?.key,
			});
		}
		const modifiedColumns = typeModifier(columns);
		//console.log(modifiedColumns.length);
		//console.log(modifiedColumns);
		const queryString = `CREATE MATERIALIZED VIEW sessions_full_m_view AS
        SELECT 
            ${await modifiedColumns
				.map((data) => {
					return `${data.key}::${data.type} as v_${data.key}`;
				})
				.join(',\n')},
            ${await filteringTypes
				.map((data) => {
					return `(meta->>'${data.value}')::${data.type} as v_${data.value}`;
				})
				.join(',\n')}
        FROM public."sessions";`;
		//console.log(queryString);
		console.time('Full-View-Generation');
		await sequelize.query(queryString);
		console.timeEnd('Full-View-Generation');
	} catch (err) {
		console.log(err);
	}
};

generateFullView();
