const mongoose = require('mongoose');
const dotenv =require('dotenv');

dotenv.config({path:"./config/config.env"});

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URL)
        .then((data) => {
            console.log(`Mongodb connected with server: ${data.connection.host}`);
        })
        
};
console.log(connectDatabase);
module.exports =connectDatabase