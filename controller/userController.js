
const bcrypt = require('bcrypt')
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Banner = require('../model/bannerModel')

let mes


const loadRegister = async (req, res) => {
  console.log('register');
  try {
    console.log('try reg');
    res.render('registration', { mes });
    mes = null;
  }
  catch (err) {
    res.status(500).send("Server Error");
  }
};

////// Validation and security //////
const isValidName = (name) => {
  return /^[A-Za-z\s]+$/.test(name) && name.length >= 2 && name.length <= 50;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  return true;
};

const validatePassword = (password) => {
  if (password.length < 8) {
    mes = "password dont have 8 characters";
    return mes;
  }
  if (!/\d/.test(password)) {
    mes = 'Password must contain at least one number';
    return mes;
  }

  // Password is valid
  return mes = null;
};
const securPassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  }
  catch (error) {
    res.status(500).send("Server Error");
  }
};
/////
const insertUser = async (req, res) => {
  console.log('inseruser');
  try {
    console.log(req.body.email);
    const repeat = await User.findOne({ email: req.body.email });
    const ValidName = isValidName(req.body.name);
    const ValidEmail = isValidEmail(req.body.email);
    const ValidPassword = validatePassword(req.body.password);

    if (
      req.body.name === "" &&
      req.body.email === "" &&
      req.body.password === "" &&
      req.body.rePassword === "" &&
      req.body.phone == ""
    ) {
      mes = "Fill all the fields";
      res.redirect("/register");
      return false;
    } else if (req.body.name == "") {
      mes = "Enter you name";
      res.redirect("/register");
      return false;
    } else if (req.body.email == "") {
      mes = "Enter your email";
      res.redirect("/register");
      return false;
    } else if (repeat) {
      mes = "Email already exist";
      res.redirect("/register");
      return false;
    } else if (req.body.password == "") {
      mes = "Enter your password";
      res.redirect("/register");
      return false;
    } else if (req.body.rePassword == "") {
      mes = "Repeat your password";
      res.redirect("/register");
      return false;
    } else if (req.body.phone == "") {
      mes = "Enter mobile number";
      return false;
    } else if (ValidPassword != null) {
      mes = ValidPassword;
      res.redirect("/register");
      return false;
    } else if (req.body.password !== req.body.rePassword) {
      mes = "Repeat  password not correct";
      res.redirect("/register");
      return false;
    } else if (!ValidName) {
      mes = "name not correct";
      res.redirect("/register");
      return false;
    } else if (!ValidEmail) {
      mes = "email not correct";
      res.redirect("/register");
      return false;
    } else {
      console.log('hi');
      const spassword = await securPassword(req.body.password);
      const srepassword = await securPassword(req.body.rePassword);
      console.log('hi2');
      console.log(req.body, spassword);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: spassword,
        rePassword: srepassword,
      });
      const userData = await user.save();

      if (userData) {
        // sendVerifyMail(req.body.name, req.body.email, userData._id);
        res.render("login", {
          mes:
            "your registration has been succesfully completed, Please verify your email",
        });
      } else res.render("registration", { mes: "your registration has been failed" });
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
};



// USER LOGIN

const loginLoad = async (req, res) => {
  console.log('loginload');
  try {
    res.render("login", { mes });
    mes = null;
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const verifyUserLogin = async (req, res) => {
  try {
    const emailId = req.body.email;
    const passwordId = req.body.password;

    if (req.body.email == '' && req.body.password == '') {
      mes = 'Enter email and password';
      res.redirect('/login');
      return false;
    } else if (req.body.email == '') {
      mes = 'Enter your email';
      res.redirect('/login');
      return false;
    } else if (req.body.password == '') {
      mes = 'Enter your password';
      res.redirect('/login');
      return false;
    } else {
      const userData = await User.findOne({ email: emailId });

      if (userData) {
        const passwordMatch = await bcrypt.compare(passwordId, userData.password);

        if (passwordMatch) {
          if (userData.is_verified == 0) {
            mes = 'Email verification required';
            res.redirect('/login');
            return false;
          } else if (userData.is_block == 1) {
            mes = 'User is Blocked by Admin';
            res.redirect('/login');
            return false;
          } else {
            console.log('login 1st');
            req.session.user_Id = userData._id;
            res.redirect('/home');
            return true;
          }
        } else {
          mes = 'Password is incorrect';
          res.redirect('/login');
          return false;
        }
      } else {
        mes = 'Email incorrect';
        res.redirect('/login');
        return false;
      }
    }
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

const loadHome = async (req, res) => {
  console.log('loadhome');
  try {
    const session = req.session.user_Id;
    const bannerData = await Banner.find({ is_ban: 0 });
    const userData = await User.findOne({ _id: session });
    const products = await Product.find({ is_flag: 0 }).sort({ _id: -1 }).limit(8).populate('category');
    const categoryData = await Category.find({});
    cartMessage = null;
    res.render('home', { products, session, cartMessage, bannerData });

  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const loadShop = async (req, res) => {
  try {
    const productData = await Product.find({ is_flag: 0 }).populate('category');
    const categoryData = await Category.find({});
    res.render("shop", { products: productData, session: req.session.user_Id, categoryData });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
const categoryFilter = async (req, res) => {
  try {
    console.log(12468);
    let { id, search, price } = req.query;
    price = Number(price)
    console.log(typeof (price));
    console.log(req.query,price);
    console.log('search=>',search !== "undefined");
    console.log('id=>',id !== "undefined");
    console.log('price=>',req.query.price !== "undefined");
    const loginsession = req.session.user_Id;
    const category = await Category.find({});
    console.log(124);
    let productdetails;
    if (search !== "undefined") {
      console.log('1')
      if (id !== "undefined") {
        console.log('2')
        if (req.query.price != "undefined") {
          console.log('3')
          productdetails = await Product.find({
            category: id,
            $or: [{ name: { $regex: ".*" + search + ".*", $options: "i" } }],
          }).sort({ price: price })
        } else {
          console.log('4')
          // if (price != "undefined") {
          //   console.log('5')
          //   productdetails = await Product.find({
          //     category: id,
          //     $or: [{ name: { $regex: ".*" + search + ".*", $options: "i" } }],
          //   }).sort({ price: price })
          // } 
          // else {
          console.log('6')
          productdetails = await Product.find({
            category: id,
            $or: [{ name: { $regex: ".*" + search + ".*", $options: "i" } }],
          })
          // }
        }
      } else {
        if (req.query.price !=='undefined') {
          console.log('search price');
          productdetails = await Product.find({
            $or: [{ name: { $regex: ".*" + search + ".*", $options: "i" } }],
          }).sort({ price: price })
        } else {
          console.log('search only');
          productdetails = await Product.find({
            $or: [{ name: { $regex: ".*" + search + ".*", $options: "i" } }],
          })
        }
      }
    } else if (id != 'undefined') {
      console.log(124656);
      if (req.query.price !== "undefined" ) {
        console.log('price id');
        productdetails = await Product.find({ category: id }).sort({ price: price })
      } else {
        console.log('id only');
        productdetails = await Product.find({ category: id })
      }
    } else if (req.query.price) {
      console.log(2345678903456789);
      productdetails = await Product.find({}).sort({ price: price })
    }
    res.send({ success: true, products: productdetails });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const loadProductView = async (req, res) => {
  try {
    const session = req.session.user_Id;
    const productId = req.query.id;
    const productData = await Product.findById({ _id: productId }).populate('category');
    res.render("productView", { product: productData, session, mes });
    mes = null;
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const loadAddToCart = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    if (userId) {
      const userInf0 = await User.findOne({ _id: userId });
      const findTotal = userInf0.cart.map((value) => {
        return value.total
      }).reduce((a, b) => {
        return a = a + b
      }, 0);
      userInf0.cart.forEach(async (element) => {
        const grandTOTAL = await User.updateOne({ _id: userId, 'cart.product': element.product }, { $set: { 'cart.$.grandTotal': findTotal } });
      });
      const userData = await User.findOne({ _id: userId }).populate('cart.product');
      if (userData.cart.length == 0) {
        cartMessage = "Cart is empty first add item";
        res.redirect("/");
      } else {
        res.render("addToCart", { user: userData, mes, session: req.session.user_Id });
        mes = null;
      }
    } else {
      mes = "You have to login first";
      res.render("login", { mes });
      mes = null;
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

//  cart updations
const addToCart = async (req, res) => {
  try {
    const productId = req.query.id
    const userId = req.session.user_Id
    const productstock = await Product.findOne({ _id: productId })
    const pdata = productstock.quantity
    if (pdata > 1) {
      if (userId) {
        const productData = await Product.findOne({ _id: productId })
        const data = await User.findOne({ _id: userId, 'cart.product': productId })
        if (data) {
          const inc = await User.updateOne({ _id: userId, 'cart.product': productId }, { $inc: { 'cart.$.quantity': 1 } })
          const productData = await Product.findOne({ _id: productId })
          const setOne = await User.findOne({ _id: userId, 'cart.product': productId })
          const set = setOne.cart.filter((value) => {
            return value.product == productId
          })
          const totalFind = set[0].quantity * productData.price
          const total = await User.updateOne({ _id: userId, 'cart.product': productId }, { $set: { 'cart.$.total': totalFind } })
          const setOne1 = await User.findOne({ _id: userId, 'cart.product': productId })
          const findTotal = setOne1.cart.map((value) => {
            return value.total
          }).reduce((a, b) => {
            return b = a + b
          }, 0)
          setOne1.cart.forEach(async (element) => {
            const grandTOTAL = await User.updateOne({ _id: userId, 'cart.product': element.product }, { $set: { 'cart.$.grandTotal': findTotal } })
          })
          res.redirect('/addToCart')
        } else {
          await User.updateOne({ _id: userId }, {
            $push: {
              cart:
              {
                product: productData._id,
                quantity: 1,
                total: productData.price,
                size: req.body.size,
                grandTotal: productData.price
              }
            }
          })
          mes = 'Item added to cart'
          res.redirect(`/productView?id=${productId}`)
        }

      } else {
        mes = "YOU HAVE TO LOGIN FIRST"
        res.redirect("/login")
        return true
      }
    } else {
      mes = "Out of stock"
      res.redirect(`/productView?id=${productId}`)
    }

  } catch (error) {
    res.status(500).send("Server Error");
  }
}

const incrementCart = async (req, res) => {
  try {
    console.log('inccc');

    const id = req.query.id;
    const user_id = req.session.user_Id;
    const count = await User.updateOne(
      { _id: user_id, "cart.product": id },
      { $inc: { "cart.$.quantity": 1 } }
    );
    const productData = await Product.findOne({ _id: id });
    const incrementOne = await User.findOne({
      _id: user_id,
      "cart.product": id,
    });
    let productDetails = incrementOne.cart.filter((value) => {
      return value.product == id;
    });
    const totalFind = productDetails[0].quantity * productData.price;
    const total = await User.updateOne(
      { _id: user_id, "cart.product": id },
      { $set: { "cart.$.total": totalFind } }
    );
    const itemData2 = await User.findOne({
      _id: user_id,
      "cart.product": id,
    });
    const grandTotal = itemData2.cart
      .map((k) => {
        return k.total;
      })
      .reduce((a, b) => {
        return (a = a + b);
      });
    itemData2.cart.forEach(async (element) => {
      const updatedGrandTotal = await User.updateOne(
        { _id: user_id, "cart.product": element.product },
        { $set: { "cart.$.grandTotal": grandTotal } }
      );
    });
    const productData1 = await Product.findOne({ _id: id });
    const cartData = await User.findOne({ _id: user_id, 'cart.product': id });
    const cartData2 = cartData.cart.filter((value) => {
      return value.product == id;
    });
    const totalFind1 = cartData2[0].quantity * productData1.price;
    const total1 = await User.updateOne({ _id: user_id, 'cart.product': id }, { $set: { 'cart.$.total': totalFind1 } });
    const setOne1 = await User.findOne({ _id: user_id, 'cart.product': id });
    const findTotal = setOne1.cart.map((value) => {
      return value.total;
    }).reduce((a, b) => {
      return a = a + b;
    });
    const quantity = setOne1.cart.filter((value) => {
      return value.product == id;
    });
    const x = quantity[0].quantity;
    console.log(cartData2);
    res.json({ cartData2, totalFind, findTotal, id, x });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const decrementCart = async (req, res) => {
  console.log('deccc');
  try {
    const id = req.body.id;
    const user_id = req.session.user_Id;

    const cart = await User.findOne({ _id: user_id });
    const quantity = cart.cart.filter((value) => {
      return value.product == id;
    });
    console.log(quantity);
    if (quantity[0].quantity > 1) {
      const count = await User.updateOne(
        { _id: user_id, "cart.product": id },
        { $inc: { "cart.$.quantity": -1 } }
      );
      const productData = await Product.findOne({ _id: id });
      const incrementOne = await User.findOne({
        _id: user_id,
        "cart.product": id,
      });
      let productDetails = incrementOne.cart.filter((value) => {
        return value.product == id;
      });
      const totalFind = productDetails[0].quantity * productData.price;
      const total = await User.updateOne(
        { _id: user_id, "cart.product": id },
        { $set: { "cart.$.total": totalFind } }
      );
      const itemData2 = await User.findOne({
        _id: user_id,
        "cart.product": id,
      });
      const grandTotal = itemData2.cart
        .map((k) => {
          return k.total;
        })
        .reduce((a, b) => {
          return (a = a + b);
        });
      itemData2.cart.forEach(async (element) => {
        const updatedGrandTotal = await User.updateOne(
          { _id: user_id, "cart.product": element.product },
          { $set: { "cart.$.grandTotal": grandTotal } }
        );
      });

      const productData1 = await Product.findOne({ _id: id });
      const cartData = await User.findOne({ _id: user_id, "cart.product": id });
      const cartData2 = cartData.cart.filter((value) => {
        return value.product == id;
      });
      const totalFind1 = cartData2[0].quantity * productData1.price;
      const total1 = await User.updateOne(
        { _id: user_id, "cart.product": id },
        { $set: { "cart.$.total": totalFind1 } }
      );
      const setOne1 = await User.findOne({ _id: user_id, "cart.product": id });
      const findTotal = setOne1.cart
        .map((value) => {
          return value.total;
        })
        .reduce((a, b) => {
          return (a = a + b);
        });
      const quantity = setOne1.cart.filter((value) => {
        return value.product == id;
      });
      const y = quantity[0].quantity;
      res.json({ cartData2, totalFind, findTotal, id, y });
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
};


const deleteCart = async (req, res) => {
  try {
    const id = req.query.id;
    const userid = req.session.user_Id;
    if (userid) {
      const cartData = await User.findOne({ _id: userid });
      const productdetails = cartData.cart.filter((value) => {
        return value.product == id;
      });
      const grandTot = productdetails[0].grandTotal - productdetails[0].total;
      const cart = await User.findByIdAndUpdate(
        { _id: userid },
        { $pull: { cart: { product: id } } }
      );
      cart.cart.forEach(async (value) => {
        await User.updateOne(
          { _id: userid, "cart.product": value.product },
          { $set: { "cart.$.grandTotal": grandTot } }
        );
      });
      const responseData = {
        success: true,
        grandtotal: grandTot,
        qua: cart.cart.length,
        message: "removed sucssesfully",
      };
      res.json(responseData);
    } else {
      message = "please login for continue";
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
};



const loadUserDetails = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    if (userId) {
      const user = await User.findOne({ _id: userId });
      res.render("userProfile", { user, session: req.session.user_Id });
    } else {
      mes = "You have to login fisrt";
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const loadEditProfile = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    const user = await User.findOne({ _id: userId });
    res.render("editProfile", { user, session: req.session.user_Id });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    console.log('edit post', req.body, userId);
    const updateUser = await User.updateOne(
      { _id: userId },
      { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile } }
    );
    console.log('ed', updateUser);
    res.redirect("/userDetails");
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

/// Address 
const loadAddress = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    const user = await User.findOne({ _id: userId });
    res.render('profileAddress', { user, session: req.session.user_Id });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const loadAddAddress = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    const user = await User.findOne({ _id: userId });
    res.render("addAddress", { user, session: req.session.user_Id });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    const { name, mobile, pincode, district, state, towncity, house, email } = req.body;
    const user = await User.updateOne(
      { _id: userId },
      { $push: { address: { name: name, mobileNo: mobile, district: district, state: state, townCity: towncity, houseName: house, pincode: pincode, email: email } } }
    );
    res.redirect("/profileAddress");
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    const addressId = req.query.id;
    const addressIndex = req.query.index;
    const user = await User.findOne({ _id: userId, "address._id": addressId });
    const addressDetails = user.address[addressIndex];
    res.render("editAddress", { addressDetails, user, session: req.session.user_Id });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const editAddress = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    const addressId = req.query.id;
    const { name, mobile, pincode, email, district, state, towncity, house } = req.body;
    const updatedAddress = await User.findOneAndUpdate(
      { _id: userId, "address._id": addressId },
      { $set: { "address.$": { name: name, mobileNo: mobile, district: district, state: state, townCity: towncity, houseName: house, pincode: pincode, email: email } } },
      { new: true }
    );
    const user = await User.findOne({ _id: userId });
    res.render('profileAddress', { user, session: req.session.user_Id });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user_Id;
    const addressId = req.query.id;
    await User.updateOne({ _id: userId }, { $pull: { 'address': { _id: addressId } } });
    res.redirect("/profileAddress");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

const loadWishlist = async (req, res) => {
  try {
    userId = req.session.user_Id;
    if (userId) {
      const userData = await User.findOne({ _id: userId }).populate(
        "wishlist.product"
      );
      res.render("wishlist", {
        user: userData,
        mes,
        session: req.session.user_Id,
      });
      mes = null;
    } else {
      mes = "You have to login first";
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
};





const userLogout = (req, res) => {
  try {
    req.session.user_Id = null;
    res.redirect('/');
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyUserLogin,

  loadHome,
  loadShop,
  categoryFilter,
  loadProductView,

  loadAddToCart,
  addToCart,
  incrementCart,
  decrementCart,
  deleteCart,

  loadUserDetails,
  loadEditProfile,
  editProfile,

  loadAddress,
  loadAddAddress,
  addAddress,
  loadEditAddress,
  editAddress,
  deleteAddress,

  loadWishlist,




  userLogout
}