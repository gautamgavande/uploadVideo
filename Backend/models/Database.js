require('dotenv').config({ path: '/' + './.env' });
const mongoose = require('mongoose');

exports.databaseConnect = async () => {
	mongoose
		.connect(process.env.MONGODB_URI)
		.then(() => console.log('Database connection successfully !'))
		.catch(err => (err.message));
};