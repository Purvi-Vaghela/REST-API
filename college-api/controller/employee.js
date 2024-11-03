const { log } = require('console');
const express = require('express');
const app = express();
const mysql = require('mysql');


const con = mysql.createConnection({
    host: "localhost",
    password: "123",
    user: "root",
    database: "clgg"
})

const insertEmp = async(req,res) => {

    var count1 = 0 , count2 = 0 ;
    var test = false ;

  const{emp_id, fname, lname ,age ,designation ,salary, yearsOfExp, email, joiningDate, phone } = req.body;

    if(fname == ""){
        return res.status(400).send("first name can't be null");
    }
    if(lname == ""){
        return res.status(400).send("last name can't be null");
    }
    if(designation == ""){
        return res.status(400).send("designation  can't be empty!");
    }
    if(salary == "")
    return res.status(400).send("salary  can't be empty!");

    if(yearsOfExp == "")
        return res.status(400).send("yearsOfExp  can't be null");
    if(email == "")
        return res.status(400).send('email cant be null')
    if(joiningDate == "")
        return res.status(400).send("joiningDate is required")
    if(phone == "")
        return res.status(400).send('contact no cant be empty')


    const arr = ["prof" , "clerk" , "co-ordinator", "hod", "asst" , "tutor"]
    const val = designation;
    if( (arr.includes(val)) === false)
    {
        return res.status(400).send("Not proper designation");
    }

    if(arr.includes(val) )
    {
        // regex for gmail
        const exp = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/ ;
        // console.log("valid gmail");

        if(exp.test(req.body.email) == false)
        {   
            // test = true;
           
            return res.status(400).send("Invalid mail structure");
            console.log("exit1");
            exit();
        }
        
     const result = await new Promise((resolve) => {
        con.query("select count(emp_id) as cnt from employee where email = ?",[ email], (err, res) => {
          resolve(res)
        })
      })
      
    //    console.log("**********",result[0].cnt);

          if (result[0].cnt > 0) {
            console.log("email already present");
            return res.status(400).send("email already present");
           }

        if(req.body.phone!=null)
        {
            const ph = /^[0-9]{10}$/
            if(!ph.test(phone))
            {
                test = true;
                return res.status(400).send("phone no of incorrect size")
            }

        }
      
        const contact = await new Promise((resolve) => {
            con.query("select count(emp_id) as cnt from employee where phone = ?",[ phone], (err, res) => {
              resolve(res)
            })
          })

       if (contact[0].cnt > 0) {
        console.log("phone no already present");
        return res.status(400).send("phone no already present");
       }
       

        const yrofexp = /^[1-9]{0,1}[0-9]$/      // only 0 to 99
        if(yrofexp.test(req.body.yearsOfExp) == false)
        {
            return res.status(400).send("only digits are allowed in years")
        }       

    
            var sql = "insert into   employee (fname,lname,age, designation ,salary, yearsOfExp, email, joiningDate, phone ) values (?,?,?,?,?,?,?,?,?)";
            con.query(sql, [fname,lname, age,designation ,salary, yearsOfExp,  email , joiningDate, phone] ,function (err, result) {
            
            if (err) { 
                console.error('Error inserting:', err);
                    return;
            }
            
            console.log("record inserted");
            return res.status(200).send('data inserted');
            });


  }
}

  const getEmp = async(req,res) => {
    const{
        params: {emp_id: emp_Id},
    } = req ;
    // console.log(emp_Id);
   
    if(!emp_Id)
    {
        return res.status(400).send("emp id is required")
    }

    if (isNaN(emp_Id) || parseInt(emp_Id) <= 0) {
        return res.status(400).send("Invalid emp_Id");
      }
      
    const result = await new Promise((resolve) => {
        con.query("select count(emp_id) as cnt from employee where emp_id = ? and isDeleted!=1 ",[emp_Id], (err, res) => {
        resolve(res)
        })
    })
       if(result[0].cnt == 0){
        return res.status(200).send("Employee not available!")
       }
        // console.log("---",result[0].cnt );
        if(result[0].cnt == 1){
            var sql = "select * from employee where emp_id = ?";
            con.query(sql, [emp_Id], function(err, result){
                console.log("employee found!");
                return res.status(200).send(result)
            })

        } 
      
        }


  const dltEmp = async(req,res) => {
    const {emp_id } = req.body;

    const {
        params: {emp_id : emp_Id }
    } = req

    if(!emp_Id)
        return res.status(400).send("emp id is required")

    if(isNaN(emp_Id) || parseInt(emp_Id) <=0)
        return res.status(400).send("emp id is not valid")

    var sql = "select count(emp_id) as cnt from employee where emp_id = ? and isDeleted !=1";
    con.query(sql, [emp_Id], function(err,result) {
        const count = result[0].cnt ;

        // console.log(count);
        if(count == 0){
            return res.status(400).send("Data Not available!")
        }
        if(err)
            {
                console.error("Error ", err)
                return;
            }

            var sql1 = "update employee set isDeleted = 1 where emp_id = ?";
            con.query(sql1, [emp_Id], function(err,result){

                    console.log("record deleted!");
                return res.status(400).send("data deleted successfully");
            })


    });
}

const updateEmp = async(req, res) => {

    const{
        params: {emp_id : emp_Id}
    } = req;

    if(!emp_Id)
    return res.status(400).send("emp id is required")

    if(isNaN(emp_Id) || parseInt(emp_Id) <=0)
        return res.status(400).send("emp id is not valid")

    if(req.body.emp_Id){
        return res.status(400).send("emp id cannot be updated")
    }

    var sql = "select count(emp_id) as cnt from employee where emp_id = ? and isDeleted !=1";
    con.query(sql, [emp_Id], function(err,result) {
        const count = result[0].cnt ;

    if(count == 0){
        return res.status(400).send("Data Not available!")
    }

    if(err)
        {
            console.error("Error ", err)
            return;
        }
    });

    
    const toUpdate = Object.keys(req.body) 
        .map((key) => `${key} = ?`)
        .join(", ");
    const values = Object.values(req.body);
    // console.log("-------"+toUpdate);

     var sql = `update employee set ${toUpdate} where emp_id = ?`;
     con.query(sql, [...values, emp_Id], function (err, ress) {
        if (err) {
          console.error("Error updating:", err);
          return res.status(500).send("Database error");
        }
        console.log("data updated..!");
        return res.status(200).send("Data updated");
     });

  

}

module.exports = {insertEmp, getEmp , dltEmp, updateEmp}