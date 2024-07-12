const Product = require('../model/productModel')
const Category = require("../model/categoryModel")

let mes
let message
let images = []

const loadProductList = async (req, res) => {
  try {
    const productData = await Product.find().populate('category')
    res.render("productList", ({ products: productData, mes }))
    mes = null
  } catch (error) {
    res.status(500).send("Server Error");
  }
}

const addProduct = async (req, res) => {
    try {
      const category = await Category.find()
      res.render("addProduct", { mes, category, message })
      mes = null
      message = null
    } catch (error) {
      res.status(500).send("Server Error");
    }
  }

  const verifyaddProduct = async (req, res) => {
    try {
      const verifyName = await Product.findOne({ name: req.body.name })
      if (verifyName) {
        message = "Product already exists"
        res.redirect("/admin/home/product/add")
      } else if (req.body.name === '' || req.body.category === '' || req.body.price === '' || req.body.quantity === '' || req.body.description === '' || req.body.brand === '' || req.body.size === '' || !req.files || req.files.length < 3) {
        message = "Please fill all the fields and upload at least 3 photos"
        res.redirect("/admin/home/product/add")
      } else {
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        for (let i = 0; i < req.files.length; i++) {
          const extension = req.files[i].filename.split('.').pop().toLowerCase();
          if (validExtensions.includes(extension)) {
            if(req.files.length == i ) break;
            images[i] = req.files[i].filename;
          }
        }
  
          const refCategory = await Category.findOne({ name: req.body.category })
  
          const product = new Product({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            category: refCategory._id,
            description: req.body.description,
            brand: req.body.brand,
            size: req.body.size,
            image:images,
          })
  
          const productData = await product.save()
          if (productData) {
            mes = "Product added successfully"
            res.redirect("/admin/home/product/add")
          }
        }
      
    }
    catch (error) {
      res.status(500).send("Server Error");
    }
  }

  module.exports={
    loadProductList,
    addProduct,
    verifyaddProduct
  }