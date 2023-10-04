'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class sessions_two extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	sessions_two.init(
		{
			title: DataTypes.STRING,
			description: DataTypes.STRING,
			recommended_for: DataTypes.ARRAY(DataTypes.JSON),
			categories: DataTypes.ARRAY(DataTypes.JSON),
			medium: DataTypes.ARRAY(DataTypes.JSON),
			images: DataTypes.ARRAY(DataTypes.STRING),
			mentor_id: DataTypes.INTEGER,
			session_reschedule_count: DataTypes.INTEGER,
			status: DataTypes.STRING,
			time_zone: DataTypes.STRING,
			start_date: DataTypes.DATE,
			end_date: DataTypes.DATE,
			mentee_password: DataTypes.STRING,
			mentor_password: DataTypes.STRING,
			started_at: DataTypes.DATE,
			share_link: DataTypes.STRING,
			completed_at: DataTypes.DATE,
			is_feedback_skipped: DataTypes.BOOLEAN,
			mentee_feedback_questionset: DataTypes.STRING,
			mentor_feedback_questionset: DataTypes.STRING,
			meeting_info: DataTypes.JSON,
			meta: DataTypes.JSONB,
			visibility: DataTypes.STRING,
			organisation_ids: DataTypes.ARRAY(DataTypes.STRING),
			mentor_org_id: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'sessions_two',
			tableName: 'sessions_two',
		}
	);
	return sessions_two;
};
