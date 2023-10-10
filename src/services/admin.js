'use strict';
const entityTypeQueries = require('@database/queries/entityType');
const { sequelize } = require('@database/models/index');

const groupByModelNames = async (entityTypes) => {
	const groupedData = new Map();
	entityTypes.forEach((item) => {
		item.model_names.forEach((modelName) => {
			if (groupedData.has(modelName)) {
				groupedData.get(modelName).entityTypes.push(item);
				groupedData.get(modelName).entityTypeValueList.push(item.value);
			} else
				groupedData.set(modelName, {
					modelName: modelName,
					entityTypes: [item],
					entityTypeValueList: [item.value],
				});
		});
	});

	return [...groupedData.values()];
};

const filterConcreteAndMetaAttributes = async (modelAttributes, attributesList) => {
	try {
		const concreteAttributes = [];
		const metaAttributes = [];
		attributesList.forEach((attribute) => {
			if (modelAttributes.includes(attribute)) concreteAttributes.push(attribute);
			else metaAttributes.push(attribute);
		});
		return { concreteAttributes, metaAttributes };
	} catch (err) {
		console.log(err);
	}
};

const rawAttributesTypeModifier = async (rawAttributes) => {
	try {
		const outputArray = [];
		for (const key in rawAttributes) {
			if (key === 'deleted_at') continue;
			const columnInfo = rawAttributes[key];
			const type = columnInfo.type.key;
			const subField = columnInfo.type.options?.type?.key;
			const typeMap = {
				ARRAY: {
					JSON: 'json[]',
					STRING: 'character varying[]',
				},
				INTEGER: 'integer',
				DATE: 'timestamp with time zone',
				BOOLEAN: 'boolean',
				JSONB: 'jsonb',
				JSON: 'json',
				STRING: 'character varying',
			};
			const conversion = typeMap[type];
			if (conversion) {
				if (type === 'DATE' && (key === 'createdAt' || key === 'updatedAt')) {
					continue;
				}
				outputArray.push({
					key: key,
					type: subField ? typeMap[type][subField] : conversion,
				});
			}
		}
		return outputArray;
	} catch (err) {
		console.log(err);
	}
};

const generateRandomCode = (length) => {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		result += charset[randomIndex];
	}
	return result;
};

const materializedViewQueryBuilder = async (model, concreteFields, metaFields) => {
	try {
		const tableName = model.tableName;
		const temporaryMaterializedViewName = `m_${tableName}_${generateRandomCode(8)}`;
		const materializedViewGenerationQuery = `CREATE MATERIALIZED VIEW ${temporaryMaterializedViewName} AS
        SELECT 
            ${await concreteFields
				.map((data) => {
					return `${data.key}::${data.type} as ${data.key}`;
				})
				.join(',\n')},
            ${await metaFields
				.map((data) => {
					return `(meta->>'${data.value}')::${data.data_type} as ${data.value}`;
				})
				.join(',\n')}
        FROM public."${tableName}";`;
		return { materializedViewGenerationQuery, temporaryMaterializedViewName };
	} catch (err) {
		console.log(err);
	}
};

const createIndexesOnAllowFilteringFields = async (model, modelEntityTypes) => {
	try {
		await Promise.all(
			modelEntityTypes.entityTypeValueList.map(async (attribute) => {
				return await sequelize.query(`CREATE INDEX idx_${attribute} ON m_${model.tableName} (${attribute});`);
			})
		);
	} catch (err) {
		console.log(err);
	}
};

const deleteMaterializedView = async (viewName) => {
	try {
		await sequelize.query(`DROP MATERIALIZED VIEW ${viewName};`);
	} catch (err) {
		console.log(err);
	}
};

const renameMaterializedView = async (temporaryMaterializedViewName, tableName) => {
	const t = await sequelize.transaction();
	try {
		let randomViewName = `m_${tableName}_${generateRandomCode(8)}`;
		//const checkOriginalViewQuery = `SELECT EXISTS (SELECT 1 FROM pg_materialized_views WHERE viewname = 'm_${tableName}');`;
		const checkOriginalViewQuery = `SELECT COUNT(*) from pg_matviews where matviewname = 'm_${tableName}';`;
		const renameOriginalViewQuery = `ALTER MATERIALIZED VIEW m_${tableName} RENAME TO ${randomViewName};`;
		const renameNewViewQuery = `ALTER MATERIALIZED VIEW ${temporaryMaterializedViewName} RENAME TO m_${tableName};`;

		const temp = await sequelize.query(checkOriginalViewQuery);
		console.log('VIEW EXISTS: ', temp[0][0].count);
		if (temp[0][0].count > 0) await sequelize.query(renameOriginalViewQuery, { transaction: t });
		else randomViewName = null;
		await sequelize.query(renameNewViewQuery, { transaction: t });
		await t.commit();
		console.log('Transaction committed successfully');
		return randomViewName;
	} catch (error) {
		await t.rollback();
		console.error('Error executing transaction:', error);
	}
};

const createViewUniqueIndexOnPK = async (model) => {
	try {
		const primaryKeys = model.primaryKeyAttributes;
		/* CREATE UNIQUE INDEX unique_index_name
ON my_materialized_view (column1, column2); */
		const result = await sequelize.query(`
            CREATE UNIQUE INDEX unique_index${primaryKeys.map((key) => `_${key}`)} 
            ON m_${model.tableName} (${primaryKeys.map((key) => `${key}`).join(', ')});`);
		console.log('UNIQUE RESULT: ', result);
	} catch (err) {
		console.log(err);
	}
};

const generateMaterializedView = async (modelEntityTypes) => {
	try {
		//console.log('MODEL ENTITY TYPES:', modelEntityTypes);
		const model = require('@database/models/index')[modelEntityTypes.modelName];
		const { concreteAttributes, metaAttributes } = await filterConcreteAndMetaAttributes(
			Object.keys(model.rawAttributes),
			modelEntityTypes.entityTypeValueList
		);
		//console.log('GENERATE MATERIALIZED VIEW: ', concreteAttributes, metaAttributes);
		const concreteFields = await rawAttributesTypeModifier(model.rawAttributes);
		const metaFields = await modelEntityTypes.entityTypes
			.map((entity) => {
				if (metaAttributes.includes(entity.value)) return entity;
				else null;
			})
			.filter(Boolean);
		/* console.log('MODIFIED TYPES: ', concreteFields);
		console.log('META FIELDS: ', metaFields); */
		const { materializedViewGenerationQuery, temporaryMaterializedViewName } = await materializedViewQueryBuilder(
			model,
			concreteFields,
			metaFields
		);
		console.log('QUERRRRRRRRRRRRRRRRY:', materializedViewGenerationQuery);
		await sequelize.query(materializedViewGenerationQuery);
		console.log('GENERATEDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
		const randomViewName = await renameMaterializedView(temporaryMaterializedViewName, model.tableName);
		if (randomViewName) await deleteMaterializedView(randomViewName);
		await createIndexesOnAllowFilteringFields(model, modelEntityTypes);
		await createViewUniqueIndexOnPK(model);
	} catch (err) {
		console.log(err);
	}
};

const getAllowFilteringEntityTypes = async () => {
	try {
		return await entityTypeQueries.findAllEntityTypes(
			{
				allow_filtering: true,
			},
			['id', 'value', 'label', 'data_type', 'org_id', 'has_entities', 'model_names']
		);
	} catch (err) {
		console.log(err);
	}
};

const triggerViewBuild = async () => {
	try {
		const allowFilteringEntityTypes = await getAllowFilteringEntityTypes();
		console.log(allowFilteringEntityTypes);
		const entityTypesGroupedByModel = await groupByModelNames(allowFilteringEntityTypes);
		await Promise.all(
			entityTypesGroupedByModel.map(async (modelEntityTypes) => {
				return generateMaterializedView(modelEntityTypes);
			})
		);
		return entityTypesGroupedByModel;
	} catch (err) {
		console.log(err);
	}
};

////////////////////////////////////////////////////////////////////////////////////
//Refresh Flow

const modelNameCollector = async (entityTypes) => {
	try {
		const modelSet = new Set();
		await Promise.all(
			entityTypes.map(async ({ model_names }) => {
				console.log(model_names);
				if (model_names && Array.isArray(model_names))
					await Promise.all(
						model_names.map((model) => {
							if (!modelSet.has(model)) modelSet.add(model);
						})
					);
			})
		);
		console.log(modelSet);
		return [...modelSet.values()];
	} catch (err) {
		console.log(err);
	}
};

const refreshMaterializedView = async (modelName) => {
	try {
		const model = require('@database/models/index')[modelName];
		const [result, metadata] = await sequelize.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY m_${model.tableName}`);
		console.log(result, metadata);
	} catch (err) {
		console.log(err);
	}
};

const refreshNextView = (currentIndex, modelNames) => {
	try {
		if (currentIndex < modelNames.length) {
			refreshMaterializedView(modelNames[currentIndex]);
			currentIndex++;
		} else currentIndex = 0;
		return currentIndex;
	} catch (err) {
		console.log(err);
	}
};

const triggerPeriodicViewRefresh = async () => {
	try {
		const allowFilteringEntityTypes = await getAllowFilteringEntityTypes();
		const modelNames = await modelNameCollector(allowFilteringEntityTypes);
		console.log('MODEL NAME: ', modelNames);
		const interval = 10 * 60 * 1000;
		let currentIndex = 0;
		setInterval(() => {
			currentIndex = refreshNextView(currentIndex, modelNames);
		}, interval / modelNames.length);
		currentIndex = refreshNextView(currentIndex, modelNames);
	} catch (err) {
		console.log(err);
	}
};

const adminService = {
	triggerViewBuild,
	triggerPeriodicViewRefresh,
};

module.exports = adminService;
