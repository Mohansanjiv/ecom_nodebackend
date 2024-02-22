const catchAsyncError = require('../middleware/catchAsyncError')
const Product = require('../models/productModel')
const ApiFeatures = require('../utils/apiFeatures')
const ErrorHandler = require('../utils/errorHandler')

//create product -- Admin

exports.createProduct = catchAsyncError(async (req, res) => {
  req.body.user = req.user.id

  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product
  })
})

//Get All Products

exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = '5'

  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
  const products = await apiFeatures.query

  res.status(200).json({
    success: true,
    products
  })
})

// get product details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  const productCount = await Product.countDocuments()
  if (!product) {
    return next(new ErrorHandler('product not  found', 404))
  }
  res.status(200).json({
    success: true,
    product,
    productCount
  })
})

// update Product
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(500).json({
      success: false,
      message: 'Product Not Found'
    })
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })
  res.status(200).json({
    success: true,
    product
  })
})

// delete product

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404))
  }
  await Product.deleteOne({ _id: req.params.id }) // Use deleteOne method
  res.status(200).json({
    success: true,
    message: 'product Deleted successfully'
  })
})

//create New Review or Update the review

exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  }

  const product = await Product.findById(productId)

  const isReviewed = product.reviews.find(
    rev => rev.user.toString() === req.user._id
  )

  if (isReviewed) {
    product.reviews.forEach(rev => {
      if (rev.user.toString() === req.user._id)
        (rev.rating = rating), (rev.comment = comment)
    })
  } else {
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }

  let avg = 0
  product.reviews.forEach(rev => {
    avg += rev.rating
  })
  product.ratings = avg / product.reviews.length

  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true
  })
})

// get all reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id)

  if (!product) {
    return next(new ErrorHandler('Product not found', 404))
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews
  })
})

//delete reviews
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId)

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404))
  }

  const reviews = product.reviews.filter(
    rev => rev._id.toString() !== req.query.id.toString()
  )

  let avg = 0
  reviews.forEach(rev => {
    avg += rev.rating
  })


  const ratings = avg / reviews.length;

  const numOfReviews= reviews.length;

  await Product.findByIdAndUpdate(req.query.productId,{
    reviews,
    ratings,
    numOfReviews,
  },{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });



res.status(200).json({
    success: true,
  })
})
