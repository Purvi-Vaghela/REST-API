const { log } = require("console");
const express = require("express");
const app = express();
const mysql = require("mysql");
const { resolve } = require("path");
const { call } = require("./student");

const con = mysql.createConnection({
  host: "localhost",
  password: "123",
  user: "root",
  database: "clgg",
});

const   insertCourse = async (req, res) => {
  const { course_name, fees, duration, seats } = req.body;

  if (course_name == "") {
    return res.status(400).send("course_id can't be null");
  }
  // if(fees == ""){
  //     return res.status(400).send("fees can't be null");
  // }
  if (duration == "") {
    return res.status(400).send("duration can't be null");
  }
  if (seats == "") {
    return res.status(400).send("seats can't be null");
  }

  const yrs = /^[0-9]{1}$/;
  if (yrs.test(req.body.duration) == false) {
    return res.status(400).send("You haven't entered proper duration");
  }

  const arr = ["BBA", "BCA", "B.Tech", "B.Com", "B.Sc", "B.A"];
  const val = course_name;
  if (arr.includes(val) === false) {
    return res.status(400).send("Entered course is not appropriate");
  }

  //-----cannot  enter same course
  var count = 0;

  const result = await new Promise((resolve) => {
    con.query(
      "select count(course_id) as cnt from course where course_name = ?",
      [course_name],
      (err, res) => {
        resolve(res);
      }
    );
  });

  count = result[0].cnt;
  if (count > 0) {
    return res.status(500).send("course already exists");
  }

  if (count == 0) {
    var sql1 =
      "insert into course (course_name, fees, duration, seats) values (?,?,?,?) ";
   
      con.query(
      sql1,
      [course_name, fees, duration, seats],
      function (err, result) {
        if (err) {
          console.error("Error inserting:", err);
          return;
        }

        console.log("record inserted");
        return res.status(200).send("data inserted");
      }
    );
  }
};


const getCourse = async (req, res) => {
  const {
    params: { course_id: course_Id },
  } = req;

  if (!course_Id) {
    return res.status(400).send("course_id is required");
  }
  if (isNaN(course_Id) || parseInt(course_Id) <= 0) {
    return res.status(400).send("Invalid course_Id");
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

  if (result[0].cnt == 1) {
    var sql = "select * from course where course_id = ?";
    con.query(sql, [course_Id], function (err, result) {
      console.log("record found!");
      return res.status(200).send(result);
    });
  }
};

const dltCourse = async (req, res) => {

  const { course_id } = req.body;
  const {
    params: { course_id: course_Id },
  } = req;

  // console.log("--> ", insertStud.course_id);

  if (!course_Id) {
    return res.status(400).send("course id is required");
  }

  if (isNaN(course_Id) || parseInt(course_Id) <= 0) {
    return res.status(400).send("course id is not valid");
  }

  const result = await new Promise((resolve) => {
    con.query(
      "select count(course_id)as cnt from course where course_id = ?    ",
      [course_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("data not available");
  }

  var sql1 = "update course set isDeleted = 1 where course_id = ?";

  con.query(sql1, [course_Id], function (err, res) {
    console.log("course deleted!");

    var sql2 = "update student set course_id = NULL where course_id = ?";

    con.query(sql2, [course_Id], function (err, result) {
      console.log("updated in student!!!!!");
      return res.status(200).send("course_id updated in student table");
    });

    //  return res.status(200).send("data updated successfully");
  });
};



const updateCourse = async (req, res) => {
    console.log("in update");
    console.log(req.params );
    const { course_id } = req.body;
    const {
      params: { course_id: course_Id },
    } = req;

    if (!course_Id) {
      return res.status(400).send("course id is required");
    }

    if (isNaN(course_Id) || parseInt(course_Id) <= 0) {
      return res.status(400).send("course id is not valid");
    }

    const yrs = /^[0-9]{1}$/;
    if (yrs.test(req.body.duration) == false) {
      return res.status(400).send("You haven't entered proper duration");
    }

    if(req.body.course_Id){
      return res.status(403).send("cannot update course-id")
    }

    const result = await new Promise((resolve) => {
      con.query(
        "select count(course_id) as cnt from course where course_id = ? and isDeleted != 1",
        [course_Id],
        (err, res) => {
          resolve(res);
        }
      );
    });
    if (result[0].cnt == 0) {
      return res.status(400).send("data not available");
    }

    const toUpdate = Object.keys(req.body)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(req.body);

      const update = await new Promise((resolve) => {
      
  // console.log("======="+req.body);
      con.query(
        // `update course set ${toUpdate} where course_id= ?`,
        `update course set ? where course_id= ?`,
        [req.body, 6],
        function (err, res) {
          console.log(res);

          resolve(res);

          console.log(res);
        }
      );

      console.log("data updated..!");
      return res.status(200).send("Data updated");
    });
};

module.exports = { insertCourse, getCourse, dltCourse, updateCourse };
