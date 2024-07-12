const express=require('express')
const app=express()

const mongoose=require('mongoose')

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));

const path=require('path')
app.use(express.static(path.join(__dirname,'/public')))
app.set('view engine','ejs')

//////
const url='mongodb+srv://aswanthr:Aswr200018@cluster0.vxuzs9l.mongodb.net/efashion'
const url1='mongodb+srv://aswanthr:Aswr200018@cluster0.vxuzs9l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/efashion'
const mongoDBUrl='mongodb://127.0.0.1:27017/ecommerce'
mongoose.connect(url)
.then(()=>{
    console.log('mongodb connected');
})
.catch((err) => {
    console.log(`unable to connect ${err}`);
  });
/////////
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')

app.use('/',userRoute)
app.use('/admin',adminRoute)

const PORT=3000

  app.listen(PORT,()=>{
    console.log(`server listen on ${PORT}`);
})
