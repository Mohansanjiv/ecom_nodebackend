# create a express server

need to install packagaes

npm init :for install to create a eniviroment

### some packages to install

<div>
1. npm i express:- to create express server
2. npm i mongoose:-to write the path to connect the nosql server with nodejs
3. npm i dotenv:- to write envirmental file where some api keys and port and mongodb urls
4. npm i nodemon:-to start auto start of server
</div>

## file and folder creation

<div>
1. config folder:-here is .env files
2. conrtroller folder:-here some task in the js file
3. routes folder:-here routes are defined
</div>

## to create js files :-app.js and server.js

### app.js

<div>
const express =require('express');

const app =express();

app.use(express.json())

</div>

### route imports

<div>
const products=require('./routes/productRoute');

app.use('/api/v1',products)

module.exports =app

</div>

### server.js

<div>
const app = require('./app');
const dotenv =require('dotenv');

dotenv.config({path:"./config/config.env"});

app.listen(process.env.PORT,()=>{
console.log('server started at 5000');
})

</div>

### controller.productController

<div>
exports.getAllProducts =(req,res)=>{
res.status(200).json({message:"Route is working now"})
}
</div>

### routes/route.js

<div>
const express =require('express');
const { getAllProducts } = require('../controllers/productController');
const router = express.Router();
router.route('/products').get(getAllProducts);

module.exports =router;

</div>

### api testing through postman

<div>

http://localhost:5000/api/v1/products

{"message":"Route is working now"}

now my next task to make connection mongodb

1. i created database file in config folder
   note :- there is not mandatory to write mongodb query in config file and anywhere you can write

</div>

### code for creation of database in database.js

<div>
const mongoose = require('mongoose');
const dotenv =require('dotenv');

dotenv.config({path:"./config/config.env"});

const connectDatabase =()=>{
mongoose.connect(process.env.DB_URL).then((data)=>{
console.log(`Mongodb connected with server: ${data.connection.host}`);
}).catch((err)=>{
console.log(err);
})
}
module.exports =connectDatabase

</div>

### making products apis

<div>
i created productSchema

const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
name: {
type: String,
required: [true, 'Please Enter product Name'],
trim: true
},
description: {
type: String,
required: [true, 'Please Enter Your Product Description']
},
price: {
type: String,
required: [true, 'Please Enter your product price'],
maxLength: [8, 'price cannot exceed 8 characters']
},
rating: {
type: Number,
default: 0
},

images: [
{
public_id: {
type: String,
required: true
},
url: {
type: String,
required: true
}
}
],
category:{
type:String,
required:[true,'please enter product category'],
},
stock:{
type:String,
required:[true,'please enter product stock'],
maxLength:[4,'stock cannot exceed 4 characters'],
default:1,
},
numOfReviews:{
type:Number,
default:0
},
reviews:[
{
name:{
type:String,
required:true,
},
rating:{
type:Number,
required:true,
},
comment:{
type:Number,
required:true,
}
}
],
createAt:{
type:Date,
default:Date.now
}
})

module.exports=mongoose.model('Product',productSchema);

</div>

### create product

<div>
    create product in productController.js
    i wrote the code for it
    const Product =require('../models/productSchema')
</dov>

### create product

exports.createProduct =async (req,res)=>{
const product = Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })

}

exports.getAllProducts =(req,res)=>{
res.status(200).json({message:"Route is working now"})
}

### productController.js code next to do the task to import on ProductRoute.js

<div>
imported to getAllProducts
createProduct

for testing api , i tested through postman my api getAllProduct and get

now productController task for update product controlled by admin

while writing the code the i got some issue by testing postman

first issue:-update api was not working then i review and findout that i wrote this req.param.id in the place of req.params.id
second issue:-bodyparser and json

</div>

### deleteProduct task

<div>
   deleteProduct is written in productController.js of controller folder.
   issue:- remove() is outdated , in the place of remove() , deleteOne() or deleteMany() comes into pictures 17 jan 2024
</div>

### get single product details

<div>
  single product, update products, delete products have same task code 
  these are integerated to api routes
  issue:-unable to test this api in postman
  but i see the code , i found the misteak that is return the product object
</div>

## backend error handling

<div>
first folder creation:-utils>errorHnadler.js
code in class

class ErrorHandler extends Error(){
constructor(message,statusCode){
super(message);
this.statusCode=statusCode;
Error.captureStackTrace(this.this.constructor);
}
}

</div>

### status code update

<div>
module.exports =ErrorHandler;

second folder middleware folder>error.js

const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
err.statusCode = err.statusCode || 500;
err.message = err.message || "Internal Server Error";

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });

};

</div>

## create a async catch error handle

<div>
module.exports =(theFunc)=>(req,res,next)=>{
    Promise.resolve(theFunc(req,res,next)).catch(next)
}
</div>

### wrapped

<div>
const catchAsyncError = require('../middleware/catchAsyncError');
const Product =require('../models/productSchema');
const ErrorHandler = require('../utils/errorHandler');
<div>

#### wrapped catchAsyncError() with crud code

### create product -- Admin

<div>
exports.createProduct =catchAsyncError( async (req,res)=>{
    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })

})

</div>

### Get All Products

<div>
exports.getAllProducts =catchAsyncError(async (req,res)=>{
    const products =await Product.find();

    res.status(200).json({
        success:true,
        products
    })

});

</div>

### get product details

<div>
exports.getProductDetails = catchAsyncError(async(req,res,next)=>{
    const product =await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("product not  found",404));
    }
    res.status(200).json({
        success:true,
        product
    })
})
</div>

### update Product

<div>
exports.updateProduct = catchAsyncError(async (req,res,next)=>{
    let product =await Product.findById(req.params.id);
    if (!product) {
       return res.status(500).json({
          success:false,
          message:'Product Not Found'
       })
    }
    product =await Product.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true,
      useFindAndModify:false
    });
    res.status(200).json({
      success:true,
      product
    })
  
  });
</div>

### delete product catchAsyncError(crud task)

<div>
exports.deleteProduct = catchAsyncError(async(req,res,next)=>{
    const product =await Product.findById(req.params.id);
    if (!product) {
        return res.status(500).json({
            success:false,
            message:"Product Not Found"
        })
    }
    await Product.deleteOne({ _id: req.params.id }); // Use deleteOne method
    res.status(200).json({
        success:true,
        message:'product Deleted successfully'
    })
})
</div>

### unhandled promise rejection

#### we have to add in server.js

<div>
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    })
})
</div>

### mongodb error

<div>
 i have to write the code for it in error.js
  inside module.export
  
   //wrong mongodb error
   if (err.name === 'CastError') {
     const message =`Resource not found. invalid: ${err.path} `;
     err=new ErrorHandler(message,400);
   }

</div>

# Search Filter Pagination

<div>
   create a apiFeatures.js in utils folder
   code

class ApiFeatures{
constructor(query,queryStr){
this.query =query;
this.queryStr=queryStr;
}
}

module.exports =ApiFeatures;

import to productController.js

//Get All Products

exports.getAllProducts =catchAsyncError(async (req,res)=>{

    const apiFeatures= ApiFeatures(Product.find(),req.body.keyword)
    const products =await Product.find();

    res.status(200).json({
        success:true,
        products
    })

});

again come to apiFeatures.js

## writing code for search products

class ApiFeatures{
constructor(query,queryStr){
this.query =query;
this.queryStr=queryStr;
}
search(){
const keyword =this.queryStr.keyword ?{

        }:{}
    }

}

module.exports =ApiFeatures;
i need to update below the {}

this.query=this.query.find({...keyword});
return this;

and i have to update
const apiFeatures= new ApiFeatures(Product.find(),req.query).search();

</div>

## code for filter product

<div>
i was facing an issue variable name this.queryCopy but removing then replace with queryCopy
like this
 removeFields.forEach(key=>delete queryCopy[key]);
</div>

## BACKEND USER & PASSWORD AUTHENCTICATION

<div>

### install some packages

     npm  i bcryptjs :- user credentials change into hash
     npm i jsonwebtoken
     npm i  validator:- in email field to be filled with only email
     npm i  nodemailer :-if someone reset or forgot password and it sends to email a link to do
     npm i cookie-parser:-jwt is stored in cookies
     npm i body-parser:-

</div>

### create another userSchema

 <div>
   create a userModel.js in the models folder
 </div>

### create a userController.js

<div>
 i was ecountering an issue that User.create is not defined but issue was
 const validator = require('validator'); // Import the validator module
</div>

### incrypting the user password in userModel.js before entering into database

<div>
   created register user file with hasing crypting and decrypting technology
   routes /register ,/login with jwt token authenctication
   
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt =require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthencatedUser =catchAsyncError(async(req,res,next)=>{
const {token} =req.cookie;

    if (!token) {
       return next(new ErrorHandler("please login to access this resource",401));
    }

const decodedData =jwt.verify(token,process.env.JWT_SECRET);
req.user = await User.findById(decodedData.id);

next();
})

#### completed register,login and logout with synchronously product(CRUD) with admin,user Authorizations

 <div>
 invloves modules
  auth.js
  ProductRoute.js
  userRoute.js
  all middleware modules
  all modules of utils
  productController.js
  userController.js
</div>
</div>

## writting the code for reset and forgotpassword

<div>
userModel.js

make a function named getResetPasswordToken
import crypto packages

userSchema.methods.getResetPasswordToken = async function (password) {
//Generating Token
const resetToken = crypto.randomBytes(20).toString('hex');

// Hashing and adding resetPasswordToken to userSchema
this.resetPasswordToken = crypto
.createHash('sha256')
.update(resetToken)
.digest('hex');

    this.resetPasswordExpire =Date.now() + 15*60*1000;
    return resetToken;

}
</div>
#### resetToken task done here

<div>
    now time comes for nodemailer to send the link in gmail 0f respective user for reset password
    email sending nodemailer 
    
   completed
</div>
</div>

<div>
we need to work get all reviews of products

## backend Product Routes API

<div>
PRODUCTS INFORMATIONS
1.create product -- Admin
2.Get All Products
3.get product details
4. update Product
5.delete product
6.create New Review or Update the review
7.get all reviews of a product
8.delete reviews
<div>

## Backend User Routes API

<div>
1.create New Review or Update the review
2.Register user
3.login user
4.logout  user
5.forgot password
6.reset password
7.get user details
8.update user password 
9.update user Profile
10.get all users  ( Admin can see no of registered users)
11.get single user ( Admin can see the users details)
12.update user Profile
13.update user role-admin
14.Delete user - admin
15.get all reviews of a product
16.delete reviews
</div>

## Making Order APIs
<div>
  1.create new order
  2.get Single  Order
  3.get logged in user can see their  Orders
  4.get All Orders --Admin
  5.update order status --Admin
  6.Delete order --Admin

  <- 90% work in backend complete->
</div>

