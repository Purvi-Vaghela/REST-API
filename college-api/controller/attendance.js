const { log } = require("console");
const express = require("express");
const { lchown } = require("fs");
const { constants } = require("fs/promises");
const app = express();
const mysql = require("mysql");
const { resolve } = require("path");

const con = mysql.createConnection({
  host: "localhost",
  password: "123",
  user: "root",
  database: "clgg",
});

const insertAttend = async (req, res) => {
  var {
    emp_id,
    halfDays,
    leaves,
    pHoliday,
    actualDays,
    totalDays,
    monthlyDays,
    entryDate,
  } = req.body;
  console.log(req.body);

  if (emp_id == "") return res.status(400).send("emp_id is must");

  if (totalDays == "") return res.status(400).send("totalDays is required ");

  if (monthlyDays == "")
    return res.status(400).send("monthlyDays is required ");

  if (entryDate == "") return res.status(400).send("entryDate is required");

  // checking emp id exists or not

  const result = await new Promise((resolve) => {
    con.query(
      "select count(emp_id) as cnt from employee where emp_id = ? and isDeleted != 1",
      [emp_id],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (result[0].cnt == 0) {
    return res.status(400).send("Employee does not exists");
  }
  console.log("hereee");

  // existance in attendance
  // const check = await new Promise((resolve) => {
  //   con.query("select count(emp_id) as cnt from attendance where emp_id = ? and isDeleted != 1",[emp_id], (err, res) => {
  //     resolve(res)
  //   })
  // })
  //   console.log("--------");

  //     if (check[0].cnt > 0) {
  //       console.log("employee already present");
  //       return res.status(400).send("employee already present in attendance table");
  //   }
  if (halfDays === undefined) {
    halfDays = 0;
  }
  if (leaves === undefined) leaves = 0;
  if (totalDays === undefined) totalDays = 0;
  if (pHoliday === undefined) pHoliday = 0;

  let workingDays = totalDays - leaves - pHoliday - halfDays / 2;

  const toInsert = Object.keys(req.body)
    .map((key) => `${key} = ?`)
    .join(", ");

  console.log("--->>>", toInsert);

  const values = Object.values(req.body);
  console.log("value", values);

  var sql =
    "insert into attendance (emp_id, workingDays, halfDays, leaves, pHoliday, totalDays, monthlyDays, entryDate ) values (?,?,?,?,?,?,?,?)";
  con.query(
    sql,
    [
      emp_id,
      workingDays,
      halfDays,
      leaves,
      pHoliday,
      totalDays,
      monthlyDays,
      entryDate,
    ],
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

const getAttend = async (req, res) => {
  const {
    params: { emp_id: emp_Id },
  } = req;
  console.log(emp_Id);

  if (!emp_Id) {
    return res.status(400).send("emp id is required");
  }

  if (isNaN(emp_Id) || parseInt(emp_Id) <= 0) {
    return res.status(400).send("Invalid emp_Id");
  }

  //checking that emp_id exist in employee table

  const emp = await new Promise((resolve) => {
    con.query(
      "select count(emp_id) as cnt from employee where emp_id = ?",
      [emp_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (emp[0].cnt != 1) {
    return res.status(400).send("Employee does not exists");
  }
  ////  checking emp in attendance table

  const result = await new Promise((resolve) => {
    con.query(
      "select count(emp_id) as cnt from attendance where emp_id = ? and isDeleted != 1",
      [emp_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });

  if (result[0].cnt == 0) {
    return res.status(400).send("attendance result  not available");
  }

  if (result[0].cnt == 1) {
    var sql = "select * from attendance where emp_id = ? and isDeleted != 1 ";
    con.query(sql, [emp_Id], function (err, ress) {
      console.log("record found!");
      return res.status(200).send(ress);
    });
  }
};

const updateAttend = async (req, res) => {
  const {
    params: { emp_id: emp_Id },
  } = req;
  console.log(emp_Id);

  if (!emp_Id) {
    return res.status(400).send("emp id is required");
  }

  if (isNaN(emp_Id) || parseInt(emp_Id) <= 0) {
    return res.status(400).send("Invalid emp_Id");
  }

  // if updating emp_id
  if (req.body.emp_id) {
    // checking emp id in attendance table
    var sql = "select count(emp_id) as cnt from employee where emp_id = ?";
    con.query(sql, [emp_Id], function (err, result) {
      const count = result[0].cnt;

      if (count == 0) {
        return res.status(400).send("Employee does not exists");
      }
      if (err) {
        console.error("Error ", err);
        return;
      }
    });
  }

  const toUpdate = Object.keys(req.body)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(req.body);

  // console.log("toooooo", req.body);

  var sql = `update attendance set ${toUpdate} where emp_id = ? and isDeleted != 1`;
  con.query(sql, [...values, emp_Id], function (err, result) {
    if (err) {
      console.error("Error updating:", err);
      return res.status(500).send("Database error");
    }
    console.log("data updated..!");
    return res.status(200).send("Data updated");
  });

  const result = await new Promise((resolve) => {
    con.query(
      "select halfDays, leaves, pHoliday ,totalDays from attendance where emp_id = ?",
      [emp_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });

  const totalDays = result[0].totalDays;
  const leaves = result[0].leaves;
  const pHoliday = result[0].pHoliday;
  const halfDays = result[0].halfDays;
  workingDays = totalDays - leaves - pHoliday - halfDays / 2;

  var sql = "update attendance set workingDays= ? where emp_id = ? ";
  con.query(sql, [workingDays, emp_Id], function (err, result) {
    if (err) {
      console.error("Error updating:", err);
      return res.status(500).send("Database error");
    }
  });
};

const deleteAttend = async (req, res) => {
  const {
    params: { emp_id: emp_Id },
  } = req;
  console.log(emp_Id);

  if (!emp_Id) {
    return res.status(400).send("emp id is required");
  }

  if (isNaN(emp_Id) || parseInt(emp_Id) <= 0) {
    return res.status(400).send("Invalid emp_Id");
  }

  const dlt = await new Promise((resolve) => {
    con.query(
      "select count(emp_id) as cnt from attendance where emp_id = ? and isDeleted != 1",
      [emp_Id],
      (err, res) => {
        resolve(res);
      }
    );
  });
  if (dlt[0].cnt == 0) {
    return res.status(400).send("data not available");
  }

  var sql1 = "update attendance set isDeleted = 1 where emp_id = ?";
  con.query(sql1, [emp_Id], function (err, result) {
    console.log("record deleted!");
    return res.status(400).send("data deleted successfully");
  });
};

module.exports = { insertAttend, getAttend, updateAttend, deleteAttend };
