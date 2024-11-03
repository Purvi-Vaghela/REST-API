
const { log } = require('console');
const express = require('express');
const app = express();
const mysql = require('mysql');
const { resolve } = require('path');

 
const con = mysql.createConnection({
    host: "localhost",
    password: "123",
    user: "root",
    database: "clgg"
})


const insertSubj = async(req, res) => {
    const{stream_id, subject} = req.body

 
    if(stream_id == "")
    {
        return res.status(400).send('stream id is must')
    }

    if(subject == "")
    {
        return res.status(400).send('subject cannot be null')
    }

   
    // checking existance in stream table
    const value = await new Promise((resolve) => {
        con.query("select count(stream_id) as cnt  from stream where stream_id= ? and isDeleted != 1",[stream_id] ,(err, res) => {
            // console.log(res);
            resolve(res)
        })
      });

      console.log("value",value);
      if (value[0].cnt == 0) {
        return res.status(400).send("stream does not exist")
    }
             
                  var sql1 = "insert into subject (stream_id, subjectName) values (?,?) ";
                  con.query(sql1, [stream_id, subject ] ,function (err, result) {
                      
                  if (err) { 
                      console.error('Error inserting:', err);
                      return;
                  }
                  
                  console.log("record inserted");
                  return res.status(200).send('data inserted');
                  });
          
         };
    

const getSubjByStreamId = async(req, res) => {

    const{
        params: {stream_id : stream_Id}
    } = req;

    if (!stream_Id) {
        return res.status(400).send("stream_id is required");
      }
      if (isNaN(stream_Id) || parseInt(stream_Id) <= 0) {
        return res.status(400).send("Invalid stream_id");
      }

    // checking existance in stream table
    const value = await new Promise((resolve) => {
        con.query("select count(stream_id) as cnt  from stream where stream_id= ? and isDeleted != 1",[stream_Id] ,(err, res) => {
            console.log(res);
            resolve(res)
        })
      });

      console.log("value",value);
      if (value[0].cnt == 0) {
        return res.status(400).send("stream does not exist")
    }


            // existance in subj table
    const result = await new Promise((resolve) => {
        con.query(
        "select count(stream_id) as cnt from subject where stream_id = ? and isDeleted != 1",
        [stream_Id],
        (err, res) => {
            resolve(res);
        }
        );
    });

    if (result[0].cnt == 0) {
        return res.status(400).send("Oops! No one opted for this stream");
    }
    if (result[0].cnt >=1) {

        const result = await new Promise((resolve) => {
            con.query("select subjectName from subject where stream_id = ? group by subjectName",[stream_Id] , (err,res) => {
                resolve(res)
            })
        })

        console.log("--->>  ",result);

    res.status(200).send(result)   
    }
}

const deleteByStream = async(req, res) => {

    const{
        params: {stream_id : stream_Id}
    } = req;


    if (!stream_Id) {
        return res.status(400).send("stream_id is required");
      }
      if (isNaN(stream_Id) || parseInt(stream_Id) <= 0) {
        return res.status(400).send("Invalid stream_id");
      }

      /////// data exists and is not dlted 

      const result = await new Promise((resolve) => {
        con.query(
          "select count(stream_id) as cnt from subject where stream_id = ? and isDeleted != 1",
          [stream_Id],
          (err, res) => {
            resolve(res);
          }

        );
      });
    
      if (result[0].cnt == 0) {
        return res.status(400).send("data not available");
      }

    
      var sql1 = "update subject set isDeleted = 1 where stream_id = ?";
    
      con.query(sql1, [stream_Id], function (err, res) {
        console.log("subject list deleted!");
        res.status(400  ).send("subject list  deleted")
      })  
}

const updateSubj = async(req, res)=>{
    const{
        params: {subjId : s_Id}
    } = req;


    if (!s_Id) {
        return res.status(400).send("stream_id is required");
      }
      if (isNaN(s_Id) || parseInt(s_Id) <= 0) {
        return res.status(400).send("Invalid stream_id");
      }

      if(req.body.subjId){
        return res.status(200).send("cannot update subjId")
      }



      const result = await new Promise((resolve) => {
        con.query(
          "select count(subjId) as cnt from subject where subjId = ? and isDeleted != 1",
          [s_Id],
          (err, res) => {
            resolve(res);
          }

        );
      })
          // console.log("str",result[0].cnt );
      if (result[0].cnt == 0) {
        return res.status(400).send("stream not available");
      }

      const toUpdate = Object.keys(req.body)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(req.body);
  
    const update = await new Promise((resolve) => {
      con.query(
        `update subject  set ${toUpdate} where subjId= ?`,
        [...values, s_Id],
        function (err, res) {
          resolve(res);
        }
      );
  
      console.log("data updated..!");
      return res.status(200).send("Data updated");
    });



}


module.exports = {insertSubj, getSubjByStreamId ,deleteByStream, updateSubj }