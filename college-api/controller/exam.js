const { log } = require("console");
const express = require("express");
const app = express();
const mysql = require("mysql");
const { resolve } = require("path");
const { json } = require("stream/consumers");

const con = mysql.createConnection({
  host: "localhost",
  password: "123",
  user: "root",
  database: "clgg",
});

const insertExam = async (req, res) => {
  const { subjId, stream_id, examDate, timing } = req.body;

  ///////////////////////////////////

  // subject must be found in subj table
  ////cannot enter same exam again

  const result = await new Promise((resolve) => {
    con.query(
      "select count(subjId) as cnt from subject where subjId = ? and isDeleted != 1",
      [subjId],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (result[0].cnt == 0) {
    return res.status(400).send("subject  does not exist");
  }

  // checking existence in exam table 
  var count = 0;
  const exam = await new Promise((resolve) => {
    con.query(
      "select count(subjId) as cnt from exam where subjId = ? and isDeleted != 1",
      [subjId],
      (err, res) => {
        // console.log("chhhecked");
        resolve(res);
      }
    );
  });

  console.log("examm: ", exam);
  count = exam[0].cnt;
  if (count == 1) {
    return res.status(500).send("exam present in exam table ");
  }

  if (count == 0) {

    const strId = await new Promise((resolve)=> {
      con.query('select stream_id from subject where subjId = ? and isDeleted != 1',
      [subjId],
      (err, res) => {
        resolve(res);
      })
    })

    const str = strId[0].stream_id;

      const insert = await new Promise((resolve) => {
        con.query(
          "insert into exam(subjId, stream_id, examDate, timing) values (?,?,?,?)",
           [subjId, str , examDate, timing],
          (err, res) => {
            resolve(res);
          }
        );
      });
   }

      res.status(200).send("exam data inserted");
    }

const getExamsByStreamId = async (req, res) => {
  const {
    params: { stream_id: stream_Id },
  } = req;

  if (!stream_Id) {
    return res.status(400).send("stream_id is required");
  }
  if (isNaN(stream_Id) || parseInt(stream_Id) <= 0) {
    return res.status(400).send("Invalid stream_id");
  }

  // checking existance in stream table
  const value = await new Promise((resolve) => {
    con.query(
      "select count(stream_id) as cnt from stream where stream_id= ? and isDeleted != 1",
      [stream_Id],
      (err, res) => {
        console.log(res);
        resolve(res);
      }
    );
  });

  console.log("value", value);
  if (value[0].cnt == 0) {
    return res.status(400).send("no one opted for this stream");
  }
  console.log("strm id",stream_Id);
  const output = await new Promise((resolve) => {
    con.query(
      "select * from exam where stream_id = ?  and isDeleted!=1",
      [stream_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });


  return res.status(200).send(output);
  }

const deleteExam = async (req, res) => {
  const {
    params: { stream_id: stream_Id },
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
      "select count(stream_id) as cnt from exam where stream_id = ? and isDeleted != 1",
      [stream_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });

  // console.log("rrr", result);

  if (result[0].cnt == 0) {
    return res.status(400).send("data not available");
  }

  // delete exam

  var sql1 = "update exam set isDeleted = 1 where stream_id = ?";

  con.query(sql1, [stream_Id], function (err, res) {
    console.log("exam deleted!");
    res.status(200).send("exam  deleted");
  });
};

const updateExambySubjId = async (req, res) => {
 
  const {
    params: {  subjId: subjID },
  } = req;

      // console.log("sss",subjID);
  if (!subjID) {
    return res.status(400).send("subj id is required");
  }

  if (isNaN(subjID) || parseInt(subjID) <= 0) {
    return res.status(400).send("Invalid subj id");
  }
  if(req.body.stream_id){
    return res.status(403).send("cannot update stream_id")
  }
  if(req.body.subjID){
    return res.status(403).send("cannot update subjId");
  }

  // subj exists in exam table ==> the thing o  ne is updating
  const result = await new Promise((resolve) => {
    con.query(
      "select count(subjId) as cnt from exam where subjId = ? and isDeleted != 1",
      [subjID], 
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (result[0].cnt == 0) {
    return res.status(400).send("subj exam not available");
  }

  //
  const subjId = req.body.subjId;

  ///TO UPDATE exam in subj table is present in subj table so checking existence

  const subj = await new Promise((resolve) => {
    con.query(
      "select count(subjId) as cnt from subject where subjId =?",
      [subjID],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (subj[0].cnt == 0) {
    return res.status(400).send("subj you entered is not valid");
  }

  if (subj[0].cnt == 1) {
    // to update subjId is already present in exam table

    const toChange = await new Promise((resolve) => {
      con.query(
        "select count(subjId) from exam where subjId = ?",
        [subjID],
        (err, res) => {
          resolve(res);
        }
      );
    });
    if (toChange[0].subjID == 1) {
      return res
        .status(400)
        .send("subj you want to update is already present in exam table");
    }



    //getting str for that subj entered
    const str = await new Promise((resolve) => {
      con.query(
        "select stream_id from subject where subjId =?",
        [subjID],
        (err, res) => {
          resolve(res);
        }
      );
    });

    const streamId = str[0].stream_id;

   
    /// updating
    const toUpdate = Object.keys(req.body)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(req.body);

    const update = await new Promise((resolve) => {
      con.query(
        `update exam set ${toUpdate} where subjId= ?`,
        [...values, subjID],
        function (err, res) {
          resolve(res);
        }
      );
      console.log("exam data updated..!");
      return res.status(200).send("exam data updated..!");
    });
  }
};

const getDetails = async (req, res) => {

  const {
    params: { examDate: examDate },
  } = req;
  console.log("datee", examDate);

  if (!examDate) {
    return res.status(400).send("exam_date is required");
  }

  const result = await new Promise((resolve) => {
    con.query(
      "select count(examDate) as cnt from exam where examDate = ? and isDeleted != 1",
      [examDate],
      (err, res) => {
        resolve(res);
      }
    );
  });


  const stud = await new Promise((resolve) => {
    con.query("select student.eno_no , student.fname, student.lname,course.course_id , course.course_name, result.stream_id ,result.marks, result.exam_no, result.subjId,subject.subjectName from result inner join student on result.eno_no  = student.eno_no inner join course on student.course_id  = course.course_id inner join subject on result.subjId = subject.subjId inner join exam on exam.exam_no = result.exam_no where exam.examDate = ?",
          [examDate],
      (err, res) => {
        resolve(res);
      });
    });
 

  console.log(stud); 


  var ans = [];
  ans.length = 4;

  var exam = [];
  var stream = [];
  var studRes = [];

  let arr = new Array(4);

  let details = [] /// array of objects 

  for (let i = 0; i < stud.length; i++) {

    details.push({
      
      student: {
        eno_no: stud[i].eno_no,
        fname: stud[i].fname,
        lname: stud[i].lname
      },
      course:{
        course_id: stud[i].course_id,
        course_name: stud[i].course_name
      },
      stream: {
        stream_id: stud[i].stream_id
      },
      result: {
        exam_no : stud[i].exam_no,
        subjectName: stud[i].subjectName,
        subjId: stud[i].subjId,
        marks: stud[i].marks
      }
    });

  
  };
  // console.log(details);

  const finalResult = await new Promise((resolve) => {
    res.status(200).send(details)
});
};

const examsInTimeFrame = async(req,res) => {

  const{examDateFrom ,  examDateTo} = req.body

    ///--> FROM date

  const  verify = await new Promise((resolve) => {
    con.query("select count(examDate) as cnt from exam where examDate= ?", [examDateFrom], (err,res)=> {
      resolve(res)
    })
  })

  if(verify[0].cnt == 0){
    return res.status(404).send("from data does not exist")
  }

  ///--> TO date

  const checkToDate = await new Promise((resolve) => {
    con.query("select count(examDate) as cnt from exam where examDate= ?", [examDateTo], (err,res)=> {
      resolve(res)
    })
  })

  if(checkToDate[0].cnt == 0){
    return res.status(404).send("To data does not exist")
  }


  if(!examDateFrom){
    return res.status(400).send("enter from date")
  }


  if(!examDateTo){
    return res.status(400).send("enter to date")
  }


  const test = await new Promise((resolve) => {
    con.query("select exam.exam_no ,exam.subjId, subject.subjectName , exam.examDate, exam.timing  from exam  inner join subject on exam.subjId  = subject.subjId  where exam.examDate between ? and ? ",
    [examDateFrom , examDateTo],
      (err, res) => {
        resolve(res);
      });
    });

      var data = []
      var exam = {}

    for(let i=0; i<test.length; i++){
       
        exam = {
          exam_no: test[i].exam_no,
          examDate: test[i].examDate,
          time: test[i].timing,
          subject :{
            subjId: test[i].subjId,
            subjectName: test[i].subjectName
          }
        }
        data.push(exam)
      }


    // console.log(data);
    return res.status(200).send(data)

}
 


module.exports = {
  insertExam,
  getExamsByStreamId,
  deleteExam,
  updateExambySubjId,
  getDetails,
  examsInTimeFrame
};
