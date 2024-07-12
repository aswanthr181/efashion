const bcrypt = require('bcrypt')

const Admin = require('../model/adminModel')
const User = require('../model/userModel')
const Banner = require("../model/bannerModel")
const Order = require("../model/orderModel")
const Product = require("../model/productModel")

let mes
let message

const loadLogin = (req, res) => {
    try {
        res.render('aLogin', { mes })
        mes = null
    } catch (error) {
        res.status(500).send("Server Error");
    }
}

const verifyAdminLogin = async (req, res) => {
    try {
        const Aemail = req.body.email
        const Apassword = req.body.password

        if (req.body.email == '' && req.body.password == '') {
            mes = 'Enter email and password'
            res.redirect('/admin')
        } else if (req.body.email == '') {
            mes = 'Enter email'
            res.redirect('/admin')
        } else if (req.body.password == '') {
            mes = 'Enter password'
            res.redirect('/admin')
        } else {
            const adminData = await Admin.findOne({ email: Aemail })

            if (adminData) {
                const passwordMatch = await bcrypt.compare(Apassword, adminData.password)

                if (passwordMatch) {
                    req.session.admin_Id = adminData._id
                    res.redirect('/admin/home')
                } else {
                    mes = "Password is incorrect"
                    res.redirect('/admin')
                }
            } else {
                mes = "Email is incorrect"
                res.redirect('/admin')
            }
        }
    } catch (err) {
        res.status(500).send("Server Error")
    }
}

const loadDashboard = async (req, res) => {
    try {
        console.log('admin home load');
        res.render('aHome', {
            message
        })
    } catch (error) {
        res.status(500).send("Server Error");
        console.log(error)
    }
}

const bannerLoad = async (req, res) => {
    try {
      const banner = await Banner.find();
      res.render('banner', { mes, message, banner });
      message = null;
      mes = null;
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };

  const verifyAddBanner = async (req, res) => {
    try {
      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        images[i] = req.files[i].filename;
      }
      const newBanner = await Banner({
        title: req.body.title,
        image: images,
        description: req.body.description
      }).save();
      if (newBanner) {
        mes = 'Successfully added new banner';
        res.redirect('/admin/banner');
      }
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };

  const deleteBanner = async (req, res) => {
    try {
      const bannerId = req.query.id;
      const banner = await Banner.find();
      const deleteBannner = await Banner.deleteOne({ _id: bannerId });
      message = 'Successfully deleted';
      res.redirect("/admin/banner");
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  const orderDetails = async (req, res) => {
    try {
      let currentPage = 1;
      if (req.query.currentpage) {
        currentPage = req.query.currentpage;
      }
      const limit = 10;
      offset = (currentPage - 1) * limit;
      const orderdetails = await Order.find({});
      const orderData = await Order.find({})
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit);
      const totalOrders = orderdetails.length;
      const totalPage = Math.ceil(totalOrders / limit);
  
      res.render("orderDetails", { orderData, currentPage, totalPage });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  const orderView = async (req, res) => {
    try {
      const orderId = req.query.id;
      const orderData = await Order.findById({ _id: orderId }).populate(
        "order.product"
      );
      res.render("adminOrderViews", { orderData });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  const ordershipped = async (req, res) => {
    try { 
      const id = req.query.id;
      const Data = await Order.findOne({ _id: id });
      const ids = Data.order.map((value) => {
        return value._id;
      });
  
      ids.forEach(async (element) => {
        await Order.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'OrderShipped' } });
      });
  
      const data = Data.order.map((value) => {
        return value.status;
      });
  
      const responseData = {
        success: true,
        status: 'OrderShipped',
      };
  
      res.json(responseData);
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };

  const orderArrived = async (req, res) => {
    try {
      const id = req.query.id;
      const Data = await Order.findOne({ _id: id });
      const ids = Data.order.map((value) => {
        return value._id;
      });
  
      const deliveredDate = new Date();
  
      ids.forEach(async (element) => {
        await Order.updateOne(
          { _id: id, 'order._id': element },
          { $set: { 'order.$.status': 'OrderDelivered', 'order.$.deliveredDate': deliveredDate } }
        );
      });
  
      const data = Data.order.map((value) => {
        return value.status;
      });
  
      const responseData = {
        success: true,
        status: 'OrderDelivered',
      };
  
      res.json(responseData);
    } catch (error) {
      console.log(error);
    }
  };
  



  const logout = (req, res) => {
    try {
      req.session.admin_Id = null;
      res.redirect('/admin');
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };

module.exports = {
    loadLogin,
    verifyAdminLogin,
    loadDashboard,
    
    bannerLoad,
    verifyAddBanner,
    deleteBanner,

    orderDetails,
    orderView,
    ordershipped,
    orderArrived,
    

    logout
}