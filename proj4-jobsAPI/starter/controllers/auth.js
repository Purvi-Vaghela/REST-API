const User = require('../models/User')
const {StatusCodes } =  require('http-status-codes')
const {badRequestError, UnauthenticatedError} = require('../errors')
const bcrypt = require('bcryptjs')


const register = async(req, res) =>{ 
    // const {name, email, password} = req.body    
    // const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash(password, salt )    
    // const tempUser = {name, email, password: hashedPassword}

    const user = await User.create({...req.body})
    const token =   user.createJWT()
    // const token = jwt.sign({userId: user._id, name: user.name} , 'jwtsecret', {expiresIn: '30d', })
    res.status(StatusCodes.CREATED).json({ user: {name: user.name }, token })
}

const login = async(req, res) => {
   const {email, password } = req.body;

   if(!email || !password){
    throw new badRequestError('please provide email and password')
   }

   const user = await User.findOne({email})

   //compare password
   if(!user){
    throw new UnauthenticatedError('Invalid credentials')
   }

}


module.exports = {register, login}



// if no user than unauthenticated err
