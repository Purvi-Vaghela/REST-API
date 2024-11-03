
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

const insertStr = async(req,res) => {

    const{stream_id, course_id, str_name , fees} = req.body ;

    if(course_id == "")
        return res.status(400).send('course_id cannot be null')
    if(str_name == "")
        return res.status(400).send('stream name cannot be null')
    if(fees == "")
      return res.status(400).send("enter fees ")


        // valid course_id
      console.log("---" , course_id);
        const value = await new Promise((resolve) => {
            con.query("select count(course_id) as cnt  from course where course_id= ? ",[course_id] ,(err, res) => {
              resolve(res)
            })
          });

          console.log(value[0].cnt);

          if(value[0].cnt != 1){
            return res.status(400).send("Invalid course_id")
          }

         if( value[0].cnt == 1) {
                console.log("course id is valid ");
               console.log("--- ", course_id);
         }

         const result = await new Promise((resolve) => {
            con.query("select count(str_name) as cnt from stream where str_name = ?",[str_name], (err, res) => {
              resolve(res)
            })
          })
    
           var count = result[0].cnt;
            if(count > 0){
                return res.status(500).send("stream already exists");
            }

            /// ---> course doesnt exist so inserting
            
            
          if(count == 0)
          {     
              var sql1 = "insert into stream (course_id, str_name, fees) values (?,?,?) ";
              con.query(sql1, [course_id, str_name, fees] ,function (err, result) {
                  
              if (err) { 
                  console.error('Error inserting:', err);
                      return;
              }
              
              console.log("stream inserted");
              return res.status(200).send('stream data inserted');
              });

            }
    
            }

const getStr = async(req, res)=> {
      const{
        params: {stream_id: stream_Id}
    } = req ;
      // console.log("---> ",stream_Id);
    if(!stream_Id)
    {
        return res.status(400).send("stream_id is required")
    }
    if (isNaN(stream_Id) || parseInt(stream_Id) <= 0) {
        return res.status(400).send("Invalid stream_Id");
      }

      const result = await new Promise((resolve) => {
        con.query("select count(stream_id) as cnt from stream where stream_id = ? and isDeleted != 1",[stream_Id], (err, res) => {
          resolve(res)
        })
      })
      
      if (result[0].cnt == 0) {
        return res.status(400).send("stream not available");
      }

      if(result[0].cnt == 1){
                    
        var sql = "select * from stream where stream_id = ?";
        con.query(sql, [stream_Id], function (err, result) {
        console.log("record found!");
        return res.status(200).send(result);
        });
}

}

const getStrByCourseId =  async(req,res) => {
      const{
        params: {course_id: course_Id}
    } = req ;

    if(!course_Id)
    {
        return res.status(400).send("course_id is required")
    }
    if (isNaN(course_Id) || parseInt(course_Id) <= 0) {
        return res.status(400).send("Invalid course_Id");
      }

      const result = await new Promise((resolve) => {
        con.query("select count(course_Id) as cnt from course where course_id = ? and isDeleted != 1",[course_Id], (err, res) => {
          resolve(res)
        })
      })
      
      if (result[0].cnt == 0) {
        return res.status(400).send("course not available");
      }
      

      if(result[0].cnt == 1){
                
        var sql = "select * from course where course_id = ?";
        con.query(sql, [course_Id], function (err, result) {
        console.log("course exist!");
        });

        ///---------->> vaidating course available in stream
        const result = await new Promise((resolve) => {
          con.query("select count(course_id) as cnt from stream where course_id = ? ",[course_Id], (err, res) => {
            resolve(res)
          })
        })
        
        if (result[0].cnt == 0) {
          return res.status(400).send("No one opted for this course");
        }
        
       const output = await new Promise((resolve) => {
          con.query("select  str_name as streamName from stream where course_id = ? group by str_name ",[course_Id], (err, res) => {
          resolve(res)
          }) 
      });
      
      return res.status(200).send(output);
      }
}

const deleteStr = async(req, res) => {

      const{
        params: {stream_id: stream_Id}
    } = req ;

    if(!stream_Id)
    {
        return res.status(400).send("stream_id is required")
    }
    if (isNaN(stream_Id) || parseInt(stream_Id) <= 0) {
        return res.status(400).send("Invalid stream_Id");
      }

        // check for already deleted or not 
      const result = await new Promise((resolve) => {
        con.query("select count(stream_id)as cnt from stream where stream_id = ? and isDeleted != 1",[stream_Id], (err, res) => {
        resolve(res)
        })
      })
      if (result[0].cnt == 0) {
          return res.status(400).send("stream not available")
      }
      var sql1 = "update stream set isDeleted = 1 where stream_id = ?";
       
      con.query(sql1, [stream_Id], function(err,res){

       console.log("stream deleted!");
      })
      res.status(200).send("stream Deleted ")
      
}

const updateStr = async(req, res) => {
        
      const{
        params: {stream_id: stream_Id}
    } = req ;

    if(!stream_Id)
    {
        return res.status(400).send("stream_id is required")
    }

    if (isNaN(stream_Id) || parseInt(stream_Id) <= 0) {
        return res.status(400).send("Invalid stream_Id");
      }

      if(req.body.stream_id){
        return res.status(400).send("stream id cannot be updated")
      }

      const result = await new Promise((resolve) => {
        con.query("select count(stream_id)as cnt from stream where stream_id = ? and isDeleted != 1",[stream_Id], (err, res) => {
        resolve(res)
        })
    })
    if (result[0].cnt == 0) {
        return res.status(400).send("stream not available")
    }

    /// updating 

    const toUpdate = Object.keys(req.body).map( (key) => `${key} = ?`).join(", ")
    const values = Object.values(req.body)

    const update = await new Promise( (resolve) => {
        con.query(`update stream set ${toUpdate} where stream_id= ?`, [...values, stream_Id], function(err,res) {
            resolve(res);
        })
        console.log("stream data updated..!");
        return res.status(200).send("stream data updated..!");
    })

}

const getStreamExams= async(req,res) => {
  const{
    params: {stream_id: stream_Id}
} = req ;

if(!stream_Id)
{
    return res.status(400).send("stream_id is required")
}
if (isNaN(stream_Id) || parseInt(stream_Id) <= 0) {
    return res.status(400).send("Invalid stream_Id");
  }

  const result = await new Promise((resolve) => {
    con.query("select count(stream_id) as cnt from stream where stream_id = ? and isDeleted != 1",[stream_Id], (err, res) => {
      resolve(res)
    })
  })
  
  if (result[0].cnt == 0) {
    return res.status(400).send("stream not available");
  }

  if(result[0].cnt == 1){
    var exams = await new Promise((resolve) => {
      con.query("select exam.exam_no ,stream.stream_id, subject.subjId, subject.subjectName , exam.examDate from subject inner join stream on subject.stream_id  = stream.stream_id inner join exam on exam.subjId = subject.subjId where stream.stream_id = ? and exam.isDeleted !=1 and stream.isDeleted !=1 and exam.isDeleted != 1", [stream_Id], (err, res) => {
        resolve(res)
      })
    
    })

  // console.log(exams.length)

    var data = []
    var output = {}

    for(let i=0; i<exams.length; i++){

      stream = {
            str_name: exams[i].str_name ,
          subject: {
            subjId: exams[i].subjId,
            subjectName: exams[i].subjectName,
            exam: {
              exam_no: exams[i].exam_no,
              examDate: exams[i].examDate
            }
          }
          }
      
        data.push(stream)
    }

    return res.status(200).send(data)


    // console.log("---",data);

  }


    
  }



module.exports = {insertStr, getStr, getStrByCourseId, deleteStr, updateStr, getStreamExams}
