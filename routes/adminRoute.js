const express=require('express')
const router = express();
const path = require("path")
const multer = require("multer");

     ///// 
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/img'))
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+''+file.originalname)
    }
})
const upload=multer({storage:storage})
     /////
router.set ('views','./views/admin');

const adminController=require('../controller/adminController')
const categoryController=require('../controller/categoryController')
const productController=require('../controller/productController')
const couponController=require('../controller/couponController')
const auth=require('../middleware/adminAuth')

router.get('/',adminController.loadLogin);
router.post('/login',adminController.verifyAdminLogin);

router.get('/home',adminController.loadDashboard);

router.get('/home/category/add',categoryController.categoryLoad)
router.post('/home/category/add',categoryController.verifyAddCategory)
router.get('/category/delete',categoryController.deleteCategory)

router.get('/home/product/list',productController.loadProductList)
router.get('/home/product/add',productController.addProduct)
router.post('/home/product/add',upload.array('images',3), productController.verifyaddProduct)

router.get("/banner",auth.isLogin,adminController.bannerLoad)
router.post('/banner',upload.array('image',3),adminController.verifyAddBanner)
router.get('/banner/delete',auth.isLogin,adminController.deleteBanner)

router.get('/coupons/create',couponController.createCoupon)
router.post('/addcoupon',couponController.validateCoupon)
router.get('/delete/coupon',couponController.deleteCoupon)

router.get('/orderDetails',adminController.orderDetails)
router.get('/orderViews',adminController.orderView)
router.post("/ordershipped",adminController.ordershipped)
router.post("/deliverOrder",adminController.orderArrived )



router.get('/logout',auth.isLogin,adminController.logout);



module.exports=router
