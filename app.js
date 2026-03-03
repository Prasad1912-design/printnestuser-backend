const express = require('express');
// require("dotenv").config({ path: "./key.env" }); // for development
require("dotenv").config();

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
  origin: "https://printnestuser-frontend-1.onrender.com/" || "http://localhost:3000",
  credentials: true,   // 👈 THIS WAS MISSING
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json());

app.get('/', (req, res) => {
  res.send('PrintNest Backend is Running 🚀');
});

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

const PORT = process.env.PORT || 5000;

connectDB().then(()=>{
  app.listen(PORT,()=>{
    console.log("Server Started Successfully");
  })
})
