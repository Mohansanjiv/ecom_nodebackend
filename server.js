const app = require('./app');
const dotenv =require('dotenv');
const connectDatabase =require('./config/database')
const bodyParser = require('body-parser');

dotenv.config({path:"./config/config.env"});

//connect to database
connectDatabase();

//middleware
app.use(bodyParser.json()); // Ensure this middleware is configured for JSON parsing

// handling uncaught exception 
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server uncaught exception  `);
    process.exit(1);
})

const server = app.listen(process.env.PORT,()=>{
    console.log('server started at 5000');
})

//unhandled promise rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    })
})

