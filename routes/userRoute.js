const express=require('express')
const session = require ('express-session');
const router=express()

const sec='abc123'
router.use(session({secret:sec ,resave:true,saveUninitialized:true}))

const auth=require('../middleware/auth')
const userController=require('../controller/userController')
const orderController=require('../controller/orderController')

router.set('views','./views/users')

router.post('/signup')
router.get('/register',userController.loadRegister)
router.post('/register',userController.insertUser)

router.get('/login',userController.loginLoad)
router.post('/login',userController.verifyUserLogin)

router.get('/home', userController.loadHome)
router.get('/', userController.loadHome)
router.get('/shop', userController.loadShop)
router.get("/categoryFilter",userController.categoryFilter)


router.get("/productView", userController.loadProductView)

router.get("/addToCart",userController.loadAddToCart)
router.post("/addToCart",userController.addToCart)
router.post("/increment",userController.incrementCart)
router.post("/decrement",userController.decrementCart)
router.get("/cart/delete",userController.deleteCart)

router.get("/wishlist",auth.isLogin,userController.loadWishlist)


router.get("/userDetails",auth.isLogin,userController.loadUserDetails)
router.get("/editProfile",auth.isLogin,userController.loadEditProfile)
router.post("/editProfileDetails",userController.editProfile)

router.get("/profileAddress",auth.isLogin,userController.loadAddress)
router.get("/addAddress",auth.isLogin,userController.loadAddAddress)
router.post("/addAddress",userController.addAddress)
router.get("/editAddress",auth.isLogin,userController.loadEditAddress)
router.post("/editAddress",userController.editAddress)
router.get("/deleteAddress",userController.deleteAddress)

router.get('/checkout',auth.isLogin,orderController.loadCheckout)
router.post('/placeOrder',auth.isLogin,orderController.placeOrder)
router.get('/orderSuccess',auth.isLogin,orderController.orderSuccess)
router.get('/razorpay',orderController.razorpay)
router.get("/orderDetails",auth.isLogin,orderController.myOrders)
router.get("/orderView",auth.isLogin,orderController.orderView)
router.post("/cancelOrder",orderController.orderCancel)
router.post("/returnOrder",orderController.returnOrder)






router.get('/logout',auth.isLogin,userController.userLogout)


module.exports=router;