const { log } = require("console");
const express = require("express");
const app = express();
const mysql = require("mysql");
const { LONG } = require("mysql/lib/protocol/constants/types");
const { resolve } = require("path");
const { exit } = require("process");

const con = mysql.createConnection({
  host: "localhost",
  password: "123",
  user: "root",
  database: "clgg",
});

const insertStud = async (req, res) => {
  const {
    eno_no,
    fname,
    lname,
    course_id,
    joiningDate,
    SSC,
    email,
    phone,
    stream_id,
  } = req.body;

  if (fname == "") {
    return res.status(400).send("first name can't be null");
  }
  if (lname == "") {
    return res.status(400).send("last name can't be null");
  }
  if (joiningDate == "") return res.status(400).send("joiningDate is required");

  if (SSC == "") return res.status(400).send("SSC percentage is required");

  if (email == "") return res.status(400).send("email cant be null");

  if (phone == "") return res.status(400).send("contact no cant be empty");
  if (stream_id == "") {
    return res.status(400).send("stream id is required");
  }
  const count = await new Promise((resolve) => {
    con.query(
      "select count(course_id) as cnt from course where course_id = ? and isDeleted!=1 ",
      [course_id],
      (err, res) => {
        resolve(res);
      }
    );
  });

  ans = count[0].cnt;
  if (ans == 0) {
    return res.status(500).send("course does not exists");
  }
  // mail validation----------------

  // regex for gmail
  const exp = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/;

  if (exp.test(req.body.email) == false) {
    return res.status(400).send("Invalid mail structure");
    console.log("exit1");
  }

  const ssc = req.body.SSC;
  if (!ssc.match(/^\d+/)) {
    return res.status(400).send("enter only numeric char for SSC grade");
  }

  const result = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from student where email = ?",
      [email],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt > 0) {
    console.log("email already present");
    return res.status(400).send("email already present");
  }

  //  phone validation-----------------------

  if (req.body.phone != null) {
    const ph = /^[0-9]{10}$/;
    if (!ph.test(phone)) {
      return res.status(400).send("phone no of incorrect size");
    }
  }
  const contact = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from student where phone = ?",
      [phone],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (contact[0].cnt > 0) {
    console.log("phone no already present");
    return res.status(400).send("phone no already present");
  }

  /// checking that course is present or not
  const course = await new Promise((resolve) => {
    con.query(
      "select count(course_id) as cnt from course where course_id= ? and isDeleted != 1 ",
      [course_id],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (course[0].cnt != 1) {
    // console.log("entered course is not present");
    return res.status(400).send("Sry! Course id is not present");
  }

  var sql =
    "insert into student (fname,lname,joiningDate, course_id,SSC, email, phone, stream_id) values (?,?,?,?,?,?,?,?)";
  con.query(
    sql,
    [fname, lname, joiningDate, course_id, SSC, email, phone, stream_id],
    function (err, result) {
      if (err) {
        console.error("Error inserting:", err);
        return;
      }

      console.log("record inserted");
      return res.status(200).send("data inserted");
    }
  );
};

const getStud = async (req, res) => {
  const { eno_no, fname, lname, course_id, joiningDate, SSC, email, phone } =
    req.body;

  const {
    params: { eno_no: Eno_no },
  } = req;

  console.log("-->> " + Eno_no);

  if (!Eno_no) {
    return res.status(400).send("eno no is needed");
  }

  if (isNaN(Eno_no) || parseInt(Eno_no) <= 0) {
    return res.status(400).send("Invalid enrollment no");
  }

  const result = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from student where eno_no = ? and isDeleted!=1 ",
      [Eno_no],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (result[0].cnt == 0) {
    return res.status(400).send("such id with student does not exist");
  }
  //   console.log("-->> "+eno_no);
  var sql = "select * from student where eno_no = ?";
  con.query(sql, [Eno_no], function (err, result) {
    console.log("record found!");

    return res.status(200).send(result);
  });
};

const dltStud = async (req, res) => {
  const { eno_no, fname, lname, course_id, joiningDate, SSC, email, phone } =
    req.body;

  const {
    params: { eno_no: Eno_no },
  } = req;

  if (!Eno_no) {
    return res.status(400).send("eno no is needed");
  }

  if (isNaN(Eno_no) || parseInt(Eno_no) <= 0) {
    return res.status(400).send("Invalid enrollment no");
  }

  const result = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from student where eno_no = ?",
      [Eno_no],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("such id with student does not exist");
  }

  var sql1 = "update student set isDeleted = 1 where eno_no = ?";
  con.query(sql1, [Eno_no], function (err, result) {
    console.log("course deleted!");
    return res.status(400).send("data deleted successfully");
  });
};
const updateStud = async (req, res) => {
  const { eno_no, fname, lname, course_id, joiningDate, SSC, email, phone } =
    req.body;

  const {
    params: { eno_no: Eno_no },
  } = req;

  if (!Eno_no) {
    return res.status(400).send("eno no is needed");
  }

  if (isNaN(Eno_no) || parseInt(Eno_no) <= 0) {
    return res.status(400).send("Invalid enrollment no");
  }

  if (req.body.eno_no) {
    return res.status(200).send("eno no cannot be updated!");
  }

  const result = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from student where eno_no = ?",
      [Eno_no],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (result[0].cnt == 0) {
    return res.status(400).send("such studentId does not exist");
  }

  const toUpdate = Object.keys(req.body)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(req.body);

  console.log("-------" + values);
  const sql = `update student set ${toUpdate} where eno_no = ? and isDeleted!=1`;
  con.query(sql, [...values, Eno_no], function (err, result) {
    console.log("data updated!");
    return res.status(400).send("data updated successfully!!");
  });
};

const fetchStudCourseWise = async (req, res) => {
  const { eno_no, fname, lname, course_id, joiningDate, SSC, email, phone } =
    req.body;

  const {
    params: { course_id: course_Id },
  } = req;

  console.log("-->> " + course_Id);

  if (!course_Id) {
    return res.status(400).send("course idis needed");
  }

  if (isNaN(course_Id) || parseInt(course_Id) <= 0) {
    return res.status(400).send("Invalid course id");
  }

  const result = await new Promise((resolve) => {
    con.query(
      "select count(course_Id) as cnt from course where course_id = ? and isDeleted != 1",
      [course_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("course not available");
  }

  const output = await new Promise((resolve) => {
    con.query(
      "select  fname, lname, stream_id from student where course_id = ? group by course_id, fname, lname, stream_id ;",
      [course_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });
  // );
  console.log(output);

  return res.status(200).send(output);
};

const fetchStudStreamWise = async (req, res) => {
  const {
    params: { stream_id: stream_Id },
  } = req;

  console.log("-->> " + stream_Id);

  if (!stream_Id) {
    return res.status(400).send("stream id is needed");
  }

  if (isNaN(stream_Id) || parseInt(stream_Id) <= 0) {
    return res.status(400).send("Invalid stream id");
  }

  const result = await new Promise((resolve) => {
    con.query(
      "select count(stream_id) as cnt from stream where stream_id = ? and isDeleted != 1",
      [stream_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("stream not available");
  }

  const output = await new Promise((resolve) => {
    con.query(
      "select  fname, lname, course_id from student where stream_id = ? group by stream_id, fname, lname, course_id ",
      [stream_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });
  console.log(output);

  return res.status(200).send(output);
};

const studentDetailsOfExam = async (req, res) => {
  const {
    params: { exam_no: Exam_no },
  } = req;

  const { finalRes } = req.body;
  //
  // console.log("------>>", Exam_no, finalRes);
  if (!Exam_no) {
    return res.status(400).send("exam no is needed");
  }

  if (isNaN(Exam_no) || parseInt(Exam_no) <= 0) {
    return res.status(400).send("Invalid exam no");
  }
  console.log(Exam_no);

  const result = await new Promise((resolve) => {
    con.query(
      "select count(exam_no) as cnt from  exam where exam_no = ? and isDeleted!=1 ",
      [Exam_no],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("such exam_no does not exist");
  }

  const stud = await new Promise((resolve) => {
    con.query(
      "select student.eno_no, student.fname,student.lname,result.exam_no , result.marks, result.subjId, result.finalRes from student inner join result on student.eno_no = result.eno_no where result.exam_no = ? and result.finalRes = ?",
      [Exam_no, finalRes],
      (err, res) => {
        resolve(res);
      }
    );
  });

  console.log(stud.length);

  var studentData = [];
  var finalAns = {};

  for (let i = 0; i < stud.length; i++) {
    console.log("i", i);
    student = {
      eno_no: stud[i].eno_no,
      fname: stud[i].fname,
      lname: stud[i].lname,

      subject: {
        subjId: stud[i].subjId,
        result: {
          exam_no: stud[i].exam_no,
          marks: stud[i].marks,
        },
      },
    };
    studentData.push(student);
  }

  return res.status(200).send(studentData);
};

const streamWiseList = async (req, res) => {
  const result = await new Promise((resolve) => {
    con.query(
      "select student.stream_id, student.eno_no, student.fname ,student.lname , stream.str_name from student inner join stream on stream.stream_id = student.stream_id group by student.stream_id , student.eno_no order by student.stream_id ",
      (err, res) => {
        resolve(res);
      }
    );
  });

//  console.log('result',result.length);

  var streams = [];
  for (let i = 0; i < result.length; i++) {
    // console.log("iiii",i);

    const outerItem = result[i];
    // console.log('outer item',outerItem);
   
    var students = [];

    var stream = {
      stream_id: outerItem.stream_id,
      str_name: outerItem.str_name,
    };

    for (let j = 0; j < result.length; j++) {
     const innerItem = result[j];
      
      //console.log("i, id: ", i, id);
      if (innerItem.stream_id === outerItem.stream_id) {
        // console.log(id);
        var student = {
          eno_no: innerItem.eno_no,
          fname: innerItem.fname,
          lname: innerItem.lname,
        };

        students.push(student);
      }
      // } else {
      //   break;
      // }
      stream = {...stream, students};

     console.log('stream',stream);
      streams.push(stream)
    }

  //  console.log('streams',streams);

  }

  console.log('stream',stream);

};




const courseWiseList = async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      con.query(
        "select student.course_id, student.eno_no , student.fname , student.lname , course.course_name from student inner join course on student.course_id = course.course_id group by student.course_id ,student.eno_no order by student.course_id",
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    const courses = {};
    
    result.forEach((row) => {

      if (! courses[row.course_name]) {
        // If not, create a new course object

        courses[row.course_name] = {
          course_id: row.course_id,
          course_name: row.course_name,
          students: [],
        };
      }
  
      courses[row.course_name].students.push({
        eno_no: row.eno_no,
        fname: row.fname,
        lname: row.lname,
      });
    });

    res.json(Object.values(courses));

  } catch (error) {
  
    console.error("Error fetching course-wise list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




module.exports = {
  insertStud,
  getStud,
  dltStud,
  updateStud,
  fetchStudCourseWise,
  fetchStudStreamWise,
  studentDetailsOfExam,
  streamWiseList,
  courseWiseList,
};
