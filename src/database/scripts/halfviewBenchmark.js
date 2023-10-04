'use strict';

const model = require('../models/index');
const { sequelize } = require('../models/index');

const getRandomField = () => {
	try {
		const fields = [];
		for (let key in model.Session.rawAttributes) {
			if (
				![
					'id',
					'recommended_for',
					'categories',
					'medium',
					'meeting_info',
					'meta',
					'organisation_ids',
					'images',
					'updatedAt',
					'createdAt',
					'completed_at',
					'started_at',
					'end_date',
					'start_date',
				].includes(key)
			)
				fields.push(key);
		}
		//console.log(fields, fields.length);
		return fields[Math.floor(Math.random() * fields.length)];
	} catch (err) {
		console.log(err);
	}
};

const fieldQueryBuilder = (field, value) => {
	if (
		[
			'share_link',
			'time_zone',
			'description',
			'title',
			'status',
			'mentee_password',
			'mentor_password',
			'mentee_feedback_questionset',
			'mentor_feedback_questionset',
			'visibility',
		].includes(field)
	) {
		return `'${value}'`;
	} else if (['updatedAt', 'createdAt', 'completed_at', 'started_at'].includes(field)) {
		console.log(new Date(value).toISOString());
		const date = new Date(value).toISOString();
		console.log(typeof date);
		return `${new Date(value).toISOString()}`;
	} else {
		return value;
	}
};

const halfViewBenchmark = async () => {
	try {
		await sequelize.query('DISCARD ALL', { logging: false });
		const rowCount = 3000;
		console.time('Initial Row Fetch');
		const sessions = await model.Session.findAll({
			order: sequelize.random(),
			limit: rowCount,
		});
		console.timeEnd('Initial Row Fetch');
		console.log('Row Count:', rowCount);
		console.log('\n');
		await sequelize.query('DISCARD ALL', { logging: false });
		console.log('Running Half-View-Benchmark-sequential');
		console.time('Half-View-Benchmark-sequential');
		/* for (let i = 0; i < rowCount; i++) {
			//console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
			const randomField = getRandomField();
			const randomIndex = Math.floor(Math.random() * rowCount);
			const randomValue = sessions[randomIndex][randomField];
			//console.log(randomField, randomValue);
			const whereClause = `WHERE t.${randomField} = ${fieldQueryBuilder(randomField, randomValue)}
            LIMIT 1`;
			await sequelize.query(
				`
            SELECT * FROM public."sessions" t 
            JOIN sessions_m_view v ON t.id = v.v_id
            ${whereClause}
            `,
				{
					logging: false,
				}
			);
			//console.log(result[0][0].id);
		} */
		console.timeEnd('Half-View-Benchmark-sequential');
		console.log('\n');

		await sequelize.query('DISCARD ALL', { logging: false });
		console.log('Running full-View-Benchmark-sequential');
		console.time('full-View-Benchmark-sequential');
		/* for (let i = 0; i < rowCount; i++) {
			//console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
			const randomField = getRandomField();
			const randomIndex = Math.floor(Math.random() * rowCount);
			const randomValue = sessions[randomIndex][randomField];
			//console.log(randomField, randomValue);
			const whereClause = `WHERE v_${randomField} = ${fieldQueryBuilder(randomField, randomValue)}
            LIMIT 1`;
			await sequelize.query(
				`
            SELECT * FROM public."sessions_full_m_view"  
            ${whereClause}
            `,
				{
					logging: false,
				}
			);
			//console.log(result[0][0]['v_id']);
		} */
		console.timeEnd('full-View-Benchmark-sequential');
		console.log('\n');

		await sequelize.query('DISCARD ALL', { logging: false });
		console.log('Running Half-View-Benchmark-Parallel');
		console.time('Half-View-Benchmark-Parallel');
		/* await Promise.all(
			sessions.map(async (session) => {
				return new Promise((resolve, reject) => {
					const randomField = getRandomField();
					const randomIndex = Math.floor(Math.random() * rowCount);
					const randomValue = sessions[randomIndex][randomField];
					const whereClause = `WHERE t.${randomField} = ${fieldQueryBuilder(randomField, randomValue)}
                LIMIT 1`;
					sequelize
						.query(
							`
                    SELECT * FROM public."sessions" t 
                    JOIN sessions_m_view v ON t.id = v.v_id
                    ${whereClause}
                    `,
							{
								logging: false,
							}
						)
						.then(() => resolve(true))
						.catch(reject);
				});
			})
		); */
		console.timeEnd('Half-View-Benchmark-Parallel');
		console.log('\n');

		await sequelize.query('DISCARD ALL', { logging: false });
		console.log('Running full-View-Benchmark-Parallel');
		console.time('full-View-Benchmark-Parallel');
		/* await Promise.all(
			sessions.map(async (session) => {
				return new Promise((resolve, reject) => {
					const randomField = getRandomField();
					const randomIndex = Math.floor(Math.random() * rowCount);
					const randomValue = sessions[randomIndex][randomField];
					const whereClause = `WHERE v_${randomField} = ${fieldQueryBuilder(randomField, randomValue)}
                LIMIT 1`;
					sequelize
						.query(
							`
                    SELECT * FROM public."sessions_full_m_view"  
                    ${whereClause}
                    `,
							{
								logging: false,
							}
						)
						.then(() => resolve(true))
						.catch(reject);
				});
			})
		); */
		console.timeEnd('full-View-Benchmark-Parallel');
		console.log('\n');

		console.log('Running Half-View-Benchmark-sequential INDEXED');
		console.time('Half-View-Benchmark-sequential INDEXED');
		for (let i = 0; i < rowCount; i++) {
			//console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
			const randomField = 'id';
			const randomIndex = Math.floor(Math.random() * rowCount);
			const randomValue = sessions[randomIndex][randomField];
			//console.log(randomField, randomValue);
			const whereClause = `WHERE t.${randomField} = ${fieldQueryBuilder(randomField, randomValue)}
            LIMIT 1`;
			await sequelize.query(
				`
            SELECT * FROM public."sessions" t 
            JOIN sessions_m_view v ON t.id = v.v_id
            ${whereClause}
            `,
				{
					logging: false,
				}
			);
			//console.log(result[0][0].id);
		}
		console.timeEnd('Half-View-Benchmark-sequential INDEXED');
		console.log('\n');
		await sequelize.query('DISCARD ALL', { logging: false });
		console.log('Running full-View-Benchmark-sequential INDEXED');
		console.time('full-View-Benchmark-sequential INDEXED');
		for (let i = 0; i < rowCount; i++) {
			//console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
			const randomField = 'id';
			const randomIndex = Math.floor(Math.random() * rowCount);
			const randomValue = sessions[randomIndex][randomField];
			//console.log(randomField, randomValue);
			const whereClause = `WHERE v_${randomField} = ${fieldQueryBuilder(randomField, randomValue)}
            LIMIT 1`;
			await sequelize.query(
				`
            SELECT * FROM public."sessions_full_m_view"  
            ${whereClause}
            `,
				{
					logging: false,
				}
			);
			//console.log(result[0][0]['v_id']);
		}
		console.timeEnd('full-View-Benchmark-sequential INDEXED');
		console.log('\n');

		await sequelize.query('DISCARD ALL', { logging: false });
		console.log('Running Half-View-Benchmark-Parallel INDEXED');
		console.time('Half-View-Benchmark-Parallel INDEXED');
		await Promise.all(
			sessions.map(async (session) => {
				return new Promise((resolve, reject) => {
					const randomField = 'id';
					const randomIndex = Math.floor(Math.random() * rowCount);
					const randomValue = sessions[randomIndex][randomField];
					const whereClause = `WHERE t.${randomField} = ${fieldQueryBuilder(randomField, randomValue)}
                LIMIT 1`;
					sequelize
						.query(
							`
                    SELECT * FROM public."sessions" t 
                    JOIN sessions_m_view v ON t.id = v.v_id
                    ${whereClause}
                    `,
							{
								logging: false,
							}
						)
						.then(() => resolve(true))
						.catch(reject);
				});
			})
		);
		console.timeEnd('Half-View-Benchmark-Parallel INDEXED');
		console.log('\n');

		await sequelize.query('DISCARD ALL', { logging: false });
		console.log('Running full-View-Benchmark-Parallel INDEXED');
		console.time('full-View-Benchmark-Parallel INDEXED');
		await Promise.all(
			sessions.map(async (session) => {
				return new Promise((resolve, reject) => {
					const randomField = 'id';
					const randomIndex = Math.floor(Math.random() * rowCount);
					const randomValue = sessions[randomIndex][randomField];
					const whereClause = `WHERE v_${randomField} = ${fieldQueryBuilder(randomField, randomValue)}
                LIMIT 1`;
					sequelize
						.query(
							`
                    SELECT * FROM public."sessions_full_m_view"  
                    ${whereClause}
                    `,
							{
								logging: false,
							}
						)
						.then(() => resolve(true))
						.catch(reject);
				});
			})
		);
		console.timeEnd('full-View-Benchmark-Parallel INDEXED');
	} catch (err) {
		console.log(err);
	}
};

halfViewBenchmark();
