const express = require('express');
const router = express.Router();

const {addProduct,
       getAllProduct,
       adminGetAllProduct,
       GetSingleProduct,
       adminUpdateOneProduct,
       adminDeleteOneProduct,
       addReview,
       deleteReview,
       getOnlyReviewsForOneProduct
    } = require('../controllers/productController')
const {isLoggedIn, customRole} = require('../middlewares/user');

//user route
router.route('/products').get(getAllProduct);
router.route('/product/:id').get(GetSingleProduct);
router.route('/addreview').put(isLoggedIn, addReview);
router.route('/deletereview').delete(isLoggedIn, deleteReview);
router.route('/productreviews').get(isLoggedIn, getOnlyReviewsForOneProduct);


//admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetAllProduct);
router.route('/admin/product/:id')
    .put(isLoggedIn, customRole('admin'), adminUpdateOneProduct)
    .delete(isLoggedIn, customRole('admin'), adminDeleteOneProduct);
 

module.exports= router;