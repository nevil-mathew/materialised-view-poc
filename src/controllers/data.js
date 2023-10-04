'use strict';
const model = require('@database/models/index');
const { metaQueries } = require('@database/queries/meta');
const adminService = require('@services/admin');

exports.getData = async (req, res) => {
	try {
		const body = req.body;
		const data = await metaQueries.getMetaRow(body);
		res.send(data);
	} catch (err) {
		console.log(err);
	}
};

exports.triggerViewRebuild = async (req, res) => {
	try {
		//Do the trigger logic here
		const result = await adminService.triggerViewBuild();
		res.send({ message: result });
	} catch (err) {
		console.log(err);
	}
};
