const orderschema = require("../model/orderModel")
const couponSchema = require("../model/couponModel")

let message
let mes = null

const createCoupon = async (req, res) => {
    try {
      const couponDetails = await couponSchema.find({});
      res.render('createCoupon', { couponDetails, message, mes });
      message = null;
      mes = null;
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  const validateCoupon = async (req, res) => {
    try {
      const { couponId, expiryDate, minAmount, maxAmount, discount, maxdiscount, couponName } = req.body;
      const couponDetails = await couponSchema.findOne({ couponName: couponName });
      if (couponDetails) {
        message = 'Coupon already exists';
        res.redirect('/admin/createCoupon');
      } else {
        const couponData = new couponSchema({
          couponName: couponName,
          couponId: couponId,
          expiryDate: expiryDate,
          maxAmount: maxAmount,
          minAmount: minAmount,
          discount: discount,
          max_discount: maxdiscount,
          status: 'Active'
        });
        const details = await couponData.save();
        mes = 'Coupon added successfully';
        res.redirect('/admin/coupons/create');
      }
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  const deleteCoupon = async (req, res) => {
    try {
      const couponId = req.query.id;
      await couponSchema.deleteOne({ _id: couponId });
      mes = 'Coupon successfully deleted';
      res.redirect('/admin/coupons/create');
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  module.exports={
    createCoupon,
    validateCoupon,
    deleteCoupon
  }