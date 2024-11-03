const mysql = require('mysql');
""
const connectDb = () => {
    return new Promise((resolve, reject) => {

        const con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "123"
        });

        con.connect(function(err) {
            if (err) {
                throw err;
            }
            console.log("Connected !");

            con.query("SHOW DATABASES LIKE 'clgg'", function (err, result) {
                if (err) {
                    reject(err); 
                    return;
                }
                if (result.length > 0) {
                    console.log("Database 'clgg' exists.");
                    resolve();
                } else {
                 
                    console.log("database clgg is not present ");

                    con.query("CREATE DATABASE clgg", function(err, result) {
                        if (err) {
                            throw err ;
                            return;
                        }
                        console.log("Database 'clgg' created!");

                    });
                }
            });
        });
    });
}

module.exports = connectDb;
