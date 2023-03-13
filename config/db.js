const mongoose = require('mongoose');

const connectWithDb = () => {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        console.log('conneted')
    })
    .then(console.log(`DB Got Connected`))
    .catch(error => {
        console.log(`DB CONNECTION ISSUE`);
        console.log(error);
        process.exit(1);
    })
}

module.exports = connectWithDb;