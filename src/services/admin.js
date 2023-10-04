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

const materializedViewQueryBuilder = async (model, concreteFields, metaFields) => {
	try {
		const tableName = model.tableName;
		const queryString = `CREATE MATERIALIZED VIEW m_${tableName} AS
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
		return queryString;
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
		const materializedViewGenerationQuery = await materializedViewQueryBuilder(model, concreteFields, metaFields);
		console.log(materializedViewGenerationQuery);
		await sequelize.query(materializedViewGenerationQuery);
	} catch (err) {
		console.log(err);
	}
};

const triggerViewBuild = async () => {
	try {
		const allowFilteringEntityTypes = await entityTypeQueries.findAllEntityTypes(
			{
				allow_filtering: true,
			},
			['id', 'value', 'label', 'data_type', 'org_id', 'has_entities', 'model_names']
		);
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

const adminService = {
	triggerViewBuild,
};

module.exports = adminService;
