const express = require('express');
const router = express.Router();

const {signup,
     login,
     logout,
     forgotPassword,
     passwordReset,
     getLoggedInUserDetails,
     changePassword,
     updateUserDetails,
     adminAllUser,
     managerAllUser,
     adminGetOneUser,
     adminUpdateOneUserDetails,
     adminDeletingParticularUser
} = require('../controllers/userController');
const {isLoggedIn, customRole} = require('../middlewares/user');
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(passwordReset);
router.route('/userDashboard').get(isLoggedIn, getLoggedInUserDetails);
router.route('/password/update').post(isLoggedIn, changePassword);
router.route('/userDashboard/update').post(isLoggedIn, updateUserDetails);

//admin only route
router.route('/admin/users').get(isLoggedIn, customRole('admin'), adminAllUser);
router
    .route('/admin/users/:id')
    .get(isLoggedIn, customRole('admin'), adminGetOneUser)
    .put(isLoggedIn, customRole('admin'), adminUpdateOneUserDetails)
    .delete(isLoggedIn, customRole('admin'), adminDeletingParticularUser)
// manager only route
router.route('/manager/users').get(isLoggedIn, customRole('manager'), managerAllUser);

module.exports = router;
