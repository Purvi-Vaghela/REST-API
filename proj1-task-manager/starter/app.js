const connectDB = require('./db/connect')
const express = require('express');
const app = express();
const tasks = require('./routes/tasks')
require('dotenv').config()
const notFound = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')


// middleware
app.use(express.static('./public'))
app.use(express.json())

const port = process.env.PORT || 3000 ;

app.use('/api/v1/tasks', tasks)

//routes
app.get('/hello', (req,res)=>{
    res.send('task manager')
})

app.use(notFound)
app.use(errorHandlerMiddleware)

// const port = 3000;

const start = async() =>{
    try{

        await connectDB(process.env.MONGO_URI)
        app.listen(port , console.log(`server listening on port - ${port}..`))
    }
    catch(error){
        console.log(error);
    }
}

start()


