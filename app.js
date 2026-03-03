const express = require('express');
require("dotenv").config({ path: "./key.env" });

const app = express();
const cors = require('cors');

const checkToken = require('./checkToken');

const routing = require('./Routes/BeforeLoginRouting/Routing');
const beforePageRouting = require('./Routes/BeforeLoginRouting/pageRoutings');
const connectDB = require('./utility/mongoConnection');
// const demo = require('./Routes/BeforeLoginRouting/demo');

const afterPageRouting = require('./Routes/AfterLoginRouting/PageRouting');
const categoryRouting = require('./Routes/AfterLoginRouting/Products');
const paymentRouting = require('./Routes/AfterLoginRouting/paymentRouting');


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,   // 👈 THIS WAS MISSING
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json());



//Before Login Routing
app.use(routing);
app.use(beforePageRouting);

// After Login Routing
app.use(afterPageRouting);

// Produst Routing
app.use(categoryRouting);

app.use(paymentRouting);

// app.get('/placeOrder',checkToken,(request,response)=>{
//   response.json({message:"Login Successful"});
// })

connectDB().then(()=>{
  app.listen(3005,()=>{
    console.log("Server Started Successfully");
  })
})
