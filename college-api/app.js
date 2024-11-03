const express = require('express');
const app = express();
const mysql = require('mysql');

// database
const connectDb = require('./createDb')

// routes 
// main route
const clg = require('./routes/clg')

app.use(express.json() )
// main route
app.use('/api', clg);


connectDb().then(() => {

    const PORT = process.env.PORT || 3005;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    }).catch(error => {
        //creating db
        console.log("Database 'clg' does not exist. Creating it...");


    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "123"
    });

    con.connect(function(err) {
        if (err) {
            console.log("Error connecting to MySQL:", err);
            return;
        }
        
        console.log("Connected to MySQL server!");

        con.query("CREATE DATABASE clgg", function(err, result) {
            if (err) {
                console.log("Error creating database:", err);
                return;
            }
            console.log("Database 'clgg' created!");

            // Start the server after creating the database
            const PORT = process.env.PORT || 3005;
          
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        });

    });

});
