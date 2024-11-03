// check username, password in post(login) request
// if exist than fine else --> create new jwt
// setup authentication so only req with JWT can access dashboard

const jwt = require('jsonwebtoken')
const {badRequest } = require('../errors')

const login = async (req, res) => {

    const {username, password} = req.body;
    if(!username || !password){
        throw new CustomAPIError('please provide username and password', 400)
    }

    const id = new Date().getDate();

        /// dont attach pass here
    const token = jwt.sign({id, username}, process.env.JWT_SECRET ,{expiresIn: '30d'}) 
    res.status(200).json({msg:  'user-created', token})
}

const dashboard = async(req,res) => {

    const luckyNumber = Math.floor(Math.random() *100)

    res.status(200).json({
        msg: `Hello ${req.  user.username}`,
        secret: `Here is your authorised data, your lucky no is: ${luckyNumber}`,
    })
 
    //    next()
}

module.exports = {login, dashboard}