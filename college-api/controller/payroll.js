
const { log } = require('console');
const express = require('express');
const { lchown } = require('fs');
const { constants } = require('fs/promises');
const app = express();
const mysql = require('mysql');
const { resolve } = require('path');

 
const con = mysql.createConnection({
    host: "localhost",
    password: "123",
    user: "root",
    database: "clgg"
})

const insertPay = async(req, res)=>{

    console.log(req.body);
    const {emp_id, payDate} = req.body ;

    if(emp_id == "")
    {
        return res.status(400).send("emp_id is must")
    }
    if(payDate == "")
    {
        return res.status(400).send("payDate is must")
    }

        //emp_id exists
    const result = await new Promise((resolve) => {
        con.query("select count(emp_id) as cnt from employee where emp_id = ? and isDeleted != 1",[emp_id], (err, res) => {
          resolve(res)
        })
      })
      if(result[0].cnt == 0)
      { 
        return res.status(400).send("Employee does not exists")
      }

        //attendance table
    const attend = await new Promise((resolve) => {
      con.query("select count(emp_id) as cnt from attendance where emp_id = ? and isDeleted != 1",[emp_id], (err, res) => {
        resolve(res)
      })
    })
    if(result[0].cnt == 0)
    {
      return res.status(400).send("Attendance does not exists")
    }

        const test = await new Promise((resolve) => {
            con.query(
              "select salary from employee where emp_id = ?",
              [emp_id],
              (err, res) => {
                resolve(res);
              }
            );
          });
          const salary = test[0].salary ;

          const days = await new Promise((resolve) => {
            con.query(
              "select monthlyDays from attendance where emp_id = ?",
              [emp_id],
              (err, res) => {
                resolve(res);
              }
            );
          });

         
         const monthlyDays = days[0].monthlyDays;
          const perDay= salary / monthlyDays ;
          const perDayAmt = perDay.toFixed(2);

          const wd = await new Promise((resolve) => {
            con.query(
              "select workingDays from attendance where emp_id = ?",
              [emp_id],
              (err, res) => {
                resolve(res);
              }
            );
          });

          const workingDays = wd[0].workingDays;

          const salaryy = workingDays * perDayAmt ;
          const paidSalary = salaryy.toFixed(2)

    
          var sql = "insert into  payroll (emp_id, payDate, paidSalary, perDayAmt) values (?,?,?,?)";
          con.query(sql, [emp_id, payDate, paidSalary, perDayAmt] ,function (err, result) {
          
          if (err) { 
              console.error('Error inserting:', err);
                  return;
          }
          
          console.log("record inserted");
          return res.status(200).send('data inserted');
          });
}



const getPay = async(req, res) => {
    const{
        params: {emp_id: emp_Id},
    } = req ;
   
    if(!emp_Id)
    {
        return res.status(400).send("emp id is required")
    }

    if (isNaN(emp_Id) || parseInt(emp_Id) <= 0) {
        return res.status(400).send("Invalid emp_Id");
      }
      


    var sql = "select count(emp_id) as cnt from employee where emp_id = ? and isDeleted != 1";
    con.query(sql, [emp_Id], function(err,result) {
        const count = result[0].cnt ;

    if(count == 0){
        return res.status(400).send("Data Not available!")
    }
    })

    if(result[0].cnt === 1)
            var sql = "select * from payroll where emp_id = ? and isDeleted != 1";
            con.query(sql, [emp_Id], function (err, ress) {
                console.log("record found!");
            return res.status(200).send(ress);
            });
    }
    

const updatePay = async(req, res) => {
 const{
    params: {emp_id: emp_Id},
} = req ;

if(!emp_Id)
{
    return res.status(400).send("emp id is required")
}

if (isNaN(emp_Id) || parseInt(emp_Id) <= 0) {
    return res.status(400).send("Invalid emp_Id");
  }

  if(req.body.emp_id){
    return res.status(400).send("emp id cannot be updated")
  }

  var sql = "select count(emp_id) as cnt from payroll where emp_id = ? and isDeleted != 1";
  con.query(sql, [emp_Id], function(err,result) {
      const count = result[0].cnt ;

  if(count == 0){
      return res.status(400).send("Data Not available!")
  }

  if(count == 1)
  {
    if(req.body.emp_id)
    {
        var sql  = "select count(emp_id) as cnt from employee where emp_id = ? and isDeleted != 1";
        con.query(sql, [req.body.emp_id] , function(err, ress){
            const count = ress[0].cnt ;

            if(count == 0){
                return res.status(400).send("Employee not available of id you entered")
            }
        })            
        if(err)
        {
            console.error("Error ", err)
            return;
        }
    }

    const toUpdate = Object.keys(req.body) 
    .map((key) => `${key} = ?`)
     .join(", ");
   const values = Object.values(req.body);
   console.log("-------"+toUpdate);

   var sql = `update payroll set ${toUpdate} where emp_id = ?`;

   con.query(sql, [...values, emp_Id], function (err, ress) {
       if (err) {
       console.error("Error updating:", err);
       return res.status(500).send("Database error");
       }

       console.log("data updated..!");
       return res.status(200).send("Data updated");
   })

  }

  })

}

const deletePay = async(req,res) => {
  const {emp_id } = req.body;

  const {
      params: {emp_id : emp_Id }
  } = req

  if(!emp_Id)
      return res.status(400).send("emp id is required")

  if(isNaN(emp_Id) || parseInt(emp_Id) <=0)
      return res.status(400).send("emp id is not valid")


      var sql = "select count(emp_id) as cnt from payroll where emp_id = ?  and isDeleted !=1 ";
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
  
              var sql1 = "update payroll set isDeleted = 1 where emp_id = ?";
              con.query(sql1, [emp_Id], function(err,result){
  
                      console.log("record deleted!");
                  return res.status(400).send("data deleted successfully");
              })
  
  
      });

}




module.exports = {insertPay, getPay, updatePay, deletePay}