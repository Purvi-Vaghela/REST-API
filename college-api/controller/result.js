const { log } = require("console");
const express = require("express");
const app = express();
const mysql = require("mysql");
const { resolve } = require("path");

const con = mysql.createConnection({
  host: "localhost",
  password: "123",
  user: "root",
  database: "clgg",
});

const insertRes = async (req, res) => {
  const { eno_no, stream_id, exam_no, marks } = req.body;

  if (eno_no == "") return res.status(400).send("eno_no cannot be null");
  if (marks == "") return res.status(400).send("Must enter marks");
  if (exam_no == "") return res.status(400).send("Must enter exam_no");

  if (marks < 0 || marks > 100) {
    return res.status(200).send("marks must be between 0 to 100");
  }

  //checking that stud eno_no exist

  const stud = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from student where eno_no = ? and isDeleted!=1",
      [eno_no],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (stud[0].cnt != 1) {
    return res.status(400).send("eno no does not exists");
  }

  // data of same eno and examm present

  const exist = await new Promise((resolve) => {
    con.query(
      "select count(exam_no) as  cnt from result where exam_no = ?",
      [eno_no],
      (err, res) => {
        resolve(res);
      }
    );
  });


  console.log("--->>",exist[0].cnt);

  if (exist[0].cnt == 1) {
    return res.status(403).send("Record already present");
  }

  const str = await new Promise((resolve) => {
    con.query(
      "select stream_id from student where eno_no = ? ",
      [eno_no],
      (err, res) => {
        resolve(res);
      }
    );
  });

  const strId = str[0].stream_id;

  // checking that a particular stream subj exists or  not ==>> in subj table
  const sub = await new Promise((resolve) => {
    con.query(
      "select count(stream_id) as count  from subject where stream_id = ?",
      [strId],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (sub[0].count == 0) {
    return res.status(200).send("stream subj does not exist");
  }

  const check = await new Promise((resolve) => {
    con.query(
      "select count(stream_id) as cnt from exam where stream_id = ?",
      [strId],
      (req, res) => {
        resolve(res);
      }
    );
  });

  if (check[0].cnt == 0) {
    return res.status(200).send("str id does not exist in exam table");
  }
  //////////////////////////////////////

  // exam No
  const examNum = await new Promise((resolve) => {
    con.query(
      "select count(exam_no) as count  from exam where stream_id = ?",
      [strId],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (examNum[0].count == 0) {
    return res
      .status(200)
      .send("exam_no for a particular stream does not exist");
  }
  //////////////////////////////////////

  // getting subj id for a particular exam no
  const subjjId = await new Promise((resolve) => {
    con.query(
      "select subjId from exam where exam_no=? ",
      [exam_no],
      (err, res) => {
        resolve(res);
      }
    );
  });

  // console.log("test:: ", subjjId[0].subjId);
  var subjId = subjjId[0].subjId;

  console.log(subjId);
  
  var sql1 =
    "insert into result(eno_no,stream_id,exam_no, marks, subjId) values(?,?,?,?,?)";
  con.query(
    sql1,
    [eno_no, strId, exam_no, marks, subjId],
    function (err, result) {
      if (err) {
        console.error("Error inserting:", err);
        return;
      }

      console.log("result inserted");
      return res.status(200).send("result data inserted");
    }
  );
};

const getResult = async (req, res) => {
  const {
    params: { eno_no: eno_No },
  } = req;

  if (!eno_No) {
    return res.status(400).send("eno_no is required");
  }
  if (isNaN(eno_No) || parseInt(eno_No) <= 0) {
    return res.status(400).send("Invalid eno_No");
  }

  //checking that stud eno_no exist

  const stud = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from student where eno_no = ?",
      [eno_No],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (stud[0].cnt != 1) {
    return res.status(400).send("eno no does not exists");
  }

  /////////////////
  const result = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from result where eno_no = ? and isDeleted != 1",
      [eno_No],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("Result not available");
  }

  if (result[0].cnt == 1) {
    var sql =
      "select fname,lname, eno_no, course_id, course_name, grade, stream_id, str_name from result where eno_no = ? ";
    con.query(sql, [eno_No], function (err, result) {
      console.log("record found!");
      return res.status(200).send(result);
    });
  }
};

const deleteResult = async (req, res) => {
  const {
    params: { eno_no: eno_No },
  } = req;

  if (!eno_No) {
    return res.status(400).send("eno_no is required");
  }
  if (isNaN(eno_No) || parseInt(eno_No) <= 0) {
    return res.status(400).send("Invalid eno_No");
  }

  /////// data exists and is not dlted
  const result = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from result where eno_no = ? and isDeleted != 1",
      [eno_No],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("data not available");
  }

  const dlt = await new Promise((resolve) => {
    con.query(
      "update result set isDeleted = 1 where eno_no = ?",
      [eno_No],
      (err, res) => {
        resolve(res);
      }
    );

    console.log("result deleted!");
    return res.status(200).send("result deleted");
  });
};

const updateResult = async (req, res) => {
  const {
    params: { eno_no: eno_No },
  } = req;

  if (!eno_No) {
    return res.status(400).send("eno_no is required");
  }
  if (isNaN(eno_No) || parseInt(eno_No) <= 0) {
    return res.status(400).send("Invalid eno_No");
  }


  const result = await new Promise((resolve) => {
    con.query(
      "select count(eno_no) as cnt from result where eno_no = ? and isDeleted != 1",
      [eno_No],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("data not available");
  }
  if(req.body.eno_no){
    return res.status(400).send("emp id cannot be updated")
  }

  /// updating
  console.log("before uppppdate");
  const toUpdate = Object.keys(req.body)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(req.body);

  const update = await new Promise((resolve) => {
    con.query(
      `update result set ${toUpdate} where eno_no= ?`,
      [...values, eno_No],
      function (err, res) {
        resolve(res);
      }
    );
    console.log("result data updated..!");
    return res.status(200).send("result data updated..!");
  });
};

module.exports = { insertRes, getResult, deleteResult, updateResult };
