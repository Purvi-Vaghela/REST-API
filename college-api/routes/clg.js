const express = require('express')
const router = express.Router()
const mysql = require('mysql');


const {  insertEmp, getEmp, dltEmp, updateEmp }  = require('../controller/employee.js')
const {  insertCourse, getCourse, dltCourse, updateCourse }  = require('../controller/course.js')
const { insertStud, getStud, dltStud, updateStud, fetchStudCourseWise, fetchStudStreamWise , studentDetailsOfExam, streamWiseList, courseWiseList} = require('../controller/student.js')
const { insertStr , getStr , getStrByCourseId, deleteStr, updateStr, getStreamExams } = require('../controller/stream.js')
const { insertSubj, getSubjByStreamId, deleteByStream, updateSubj} = require('../controller/subject.js')
const { insertExam, getExamsByStreamId, deleteExam , updateExambySubjId, getDetails, examsInTimeFrame} = require('../controller/exam.js');
const {insertRes, getResult, deleteResult, updateResult} = require('../controller/result.js');
const { insertAttend , getAttend, updateAttend ,deleteAttend } = require('../controller/attendance.js')
const { insertPay, getPay ,updatePay  ,deletePay } = require('../controller/payroll.js');


// ------------>> EMPLOYEE
router.route('/insertEmp').post(insertEmp)

router.route('/getEmp/:emp_id').get(getEmp) 
router.route('/getEmp').get(getEmp)

router.route('/dltEmp/:emp_id').delete(dltEmp) 
router.route('/dltEmp').delete(dltEmp)

router.route('/updateEmp').patch(updateEmp)
router.route('/updateEmp/:emp_id').patch(updateEmp)

// ------------->> COURSE
router.route('/insertCourse').post(insertCourse)

router.route('/getCourse').get(getCourse)
router.route('/getCourse/:course_id').get(getCourse)

router.route("/dltCourse").delete(dltCourse)
router.route("/dltCourse/:course_id").delete(dltCourse)

router.route("/updateCourse").patch(updateCourse)
router.route("/updateCourse/:course_id").patch(updateCourse)

// router.route("/call")
// ------------->> STUDENT

router.route("/insertStud").post(insertStud)

router.route('/getStud').get(getStud)
router.route('/getStud/:eno_no').get(getStud)

router.route('/dltStud').delete(dltStud)
router.route('/dltStud/:eno_no').delete(dltStud)

router.route('/updateStud').patch(updateStud)
router.route('/updateStud/:eno_no').patch(updateStud)

router.route('/studentDetailsOfExam').get(studentDetailsOfExam)
router.route('/studentDetailsOfExam/:exam_no/:finalRes').get(studentDetailsOfExam)

router.route('/streamWiseList').get(streamWiseList)
router.route('/courseWiseList').get(courseWiseList)


// ------------->> STREAM

router.route('/insertStr').post(insertStr)

router.route('/getStr').get(getStr)
router.route('/getStr/:stream_id').get(getStr)

router.route('/getStrByCourseId/:course_id').get(getStrByCourseId)
router.route('/getStrByCourseId').get(getStrByCourseId)

router.route('/deleteStr').delete(deleteStr)
router.route('/deleteStr/:stream_id').delete(deleteStr)

router.route('/updateStr').patch(updateStr)
router.route('/updateStr/:stream_id').patch(updateStr)

router.route('/getStreamExams').get(getStreamExams)
router.route('/getStreamExams/:stream_id').get(getStreamExams)

// ------------->> SUBJECT

router.route('/insertSubj').post(insertSubj)

router.route('/getSubjByStreamId').get(getSubjByStreamId)
router.route('/getSubjByStreamId/:stream_id').get(getSubjByStreamId)

router.route('/deleteByStream/:stream_id').delete(deleteByStream)
router.route('/deleteByStream').delete(deleteByStream)

// router.route('/updateSubj/:stream_id').patch(updateSubj)
// router.route('/updateSubj/').patch(updateSubj)

router.route('/updateSubj/:subjId').patch(updateSubj)
router.route('/updateSubj/').patch(updateSubj)

// ------------->> EXAM

router.route('/insertExam').post(insertExam)
router.route('/getExamsByStreamId').get(getExamsByStreamId)
router.route('/getExamsByStreamId/:stream_id').get(getExamsByStreamId)

router.route('/deleteExam').delete(deleteExam)
router.route('/deleteExam/:stream_id').delete(deleteExam)

// update by subj id
router.route('/updateExam').patch(updateExambySubjId)
router.route('/updateExam/:subjId').patch(updateExambySubjId)

router.route('/examsInTimeFrame').get(examsInTimeFrame)
// ------------->> RESULT

router.route('/insertRes').post(insertRes)

//get by eno_no
router.route('/getResult').get(getResult)
router.route('/getResult/:eno_no').get(getResult)

// delete
router.route('/deleteResult').delete(deleteResult)
router.route('/deleteResult/:eno_no').delete(deleteResult)

router.route('/updateResult').patch(updateResult)
router.route('/updateResult/:eno_no').patch(updateResult)

// ------------->> ATTENDANCE

router.route('/insertAttend').post(insertAttend)

router.route('/getAttend').get(getAttend)
router.route('/getAttend/:emp_id').get(getAttend)

// router.route('/deleteAttend/:emp_id').delete(deleteAttend)
// router.route('/deleteAttend').delete(deleteAttend)

router.route('/updateAttend').patch(updateAttend)
router.route('/updateAttend/:emp_id').patch(updateAttend)

// ------------->> PAY

router.route('/insertPay').post(insertPay)

router.route('/getPay').get(getPay)
router.route('/getPay/:emp_id').get(getPay)

router.route('/updatePay').patch(updatePay)
router.route('/updatePay/:emp_id').patch(updatePay)

router.route('/deletePay/:emp_id').delete(deletePay)
router.route('/deletePay').delete(deletePay)

// ------------->> ************** <<------------------------

router.route('/fetchStudCourseWise/:course_id').get(fetchStudCourseWise)
router.route('/fetchStudCourseWise').get(fetchStudCourseWise)

router.route('/fetchStudStreamWise/:stream_id').get(fetchStudStreamWise)
router.route('/fetchStudStreamWise').get(fetchStudStreamWise)

router.route('/getDetails').get(getDetails)
router.route('/getDetails/:examDate').get(getDetails)




module.exports = router