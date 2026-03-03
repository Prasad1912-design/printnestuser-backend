const express = require('express');
const routes = express.Router();
const multer = require('multer');
const checkToken = require('../../checkToken');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

const RegisteredUser = require('../../EntityClasses/beforeLogin_entites/RegisteredUser');


const upload = multer({ storage: multer.memoryStorage() });


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});


routes.post('/verifyToken',checkToken,(request,response)=>{
  return response.json({message:"Token Valid", success : true, data : request.user});
})

routes.get('/myProfile',checkToken,(request,response)=>{
  return response.json({message:"My Profile Page is Alive", success : true});
})

routes.get('/home',checkToken,(request,response)=>{
  return response.json({message:"Home Page is Alive", success : true});
})
routes.get('/placeOrder',checkToken,(request,response)=>{
  return response.json({message:"Place Order Page is Alive", success : true});
})

routes.post('/orderHistory',checkToken,(request,response)=>{
  response.json({message : request.body.id + " Order No. Generated"});
})

routes.get('/homePage',checkToken,(request,response)=>{
  response.json({success : true, message : "Home Page Login"});
})

routes.post('/fetchProfile',checkToken, async (request,response)=>{
  const userId = request.body.userId;
  const details = await RegisteredUser.findOne({_id : userId}).select("fileUrl companyName companyAddress primaryOwner contactNo emailId residentialAddress state city pincode");

  return response.status(200).json({data : details});
});


const transport = require('../../utility/mailConnection');

routes.post('/updateProfile',checkToken,upload.single('profileImage'), async (req, res) => {
    try {
      const { id } = req.body;

      const user = await RegisteredUser.findById(id);
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      // ✅ Allow ONLY these fields
      const allowedFields = [
        "companyName",
        "companyAddress",
        "primaryOwner",
        "contactNo",
        "residentialAddress",
        "state",
        "city",
        "pincode"
      ];

      const updatePayload = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updatePayload[field] = req.body[field];
        }
      });

      // Image upload
      if (req.file) {
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
          folder: "profile_images"
        });
        updatePayload.fileUrl = uploadResult.secure_url;
      }

      const updatedUser = await RegisteredUser.findByIdAndUpdate(
        id,
        updatePayload,
        { new: true }
      );

      // 🔐 New token with updated OrgName
      const payload = {
        id: updatedUser._id,
        OrgName: updatedUser.companyName || "Print Nest",
        companyId: updatedUser.CompanyId,
        email: updatedUser.emailId
      };

      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h"
      });

      return res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        accessToken,
        data: updatedUser,
        fileUrl: updatedUser.fileUrl
      });

    } catch (err) {
      console.error("Profile update error:", err);
      return res.status(500).json({
        status: false,
        message: "Something went wrong"
      });
    }
  }
);


module.exports = routes;