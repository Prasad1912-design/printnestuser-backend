const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const router = express.Router();
const crypto = require("crypto");
// require("dotenv").config({ path: "../cloudinary.env" });
const cloudinary = require('cloudinary').v2;

const axios = require('axios'); // added the axios at the backend to get the user details using code in oauth without going to the frontend. // We can do same thing from the front end but its insecure because we are sending the id and secret key with the request.

// Access the Collections to perform the databases operations.
const RegisteredUser = require('../../EntityClasses/beforeLogin_entites/RegisteredUser');

// Access the Company Database for entering newly Domain Names.
const Company_Db = require('../../EntityClasses/beforeLogin_entites/Domain_Company_Schema');

// Access the Reset Password Collevction(Table).
const resetPassword = require('../../EntityClasses/beforeLogin_entites/resetPasswordData');

// Access the node mailer connection to send the mails on required
const transport = require('../../utility/mailConnection');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.API_SECRET
});



const upload = multer({ storage: multer.memoryStorage() });

// Register User
router.post('/registerUser', upload.single('file'), async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // 1. Check user already exists
    const existingUser = await RegisteredUser.findOne({ emailId });
    if (existingUser) {
      return res.json({ message: "Already User Registered", status: false });
    }

    // 2. Upload image to Cloudinary
    if (!req.file) {
      return res.json({ message: "Image Not Loaded", status: false });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "PrintNestUsersLogo" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Find the Company Name If already Exists
    const hostDetails = req.headers.host;
    const hostName = hostDetails.split('.')[0];

    let CompanyDetails = await Company_Db.findOne({CompanyName : hostName});

    if(!CompanyDetails)
    {
      CompanyDetails = await Company_Db.create({comapanyDomain : hostDetails, CompanyName : hostName });
    }

    // 4. Save user
    const newUser = await RegisteredUser.create({
      ...req.body,provider:"local", CompanyId : CompanyDetails._id,
      password: hashedPassword,
      fileUrl: uploadResult.secure_url
    });

    // 5. Generate JWT
    const payload = { id: newUser._id, OrgName:newUser.companyName, companyId :newUser.CompanyId, email: newUser.emailId };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({ message: "Registered Successful", status: true, accessToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration Failed", status: false });
  }
});


// Login API
router.post('/loginApi', async (req, res) => {
  try {
    const { email_id, password_ } = req.body;

    // 1. Find user
    const user = await RegisteredUser.findOne({ emailId: email_id });
    if (!user) {
      return res.json({ message: "Invalid emailid", success: false });
    }

    // 2. Compare password
    const isPasswordMatch = await bcrypt.compare(password_, user.password);
    if (!isPasswordMatch) {
      return res.json({ message: "Invalid password", success: false });
    }

    // 3. Generate JWT
    const payload = { id: user._id, OrgName:user.companyName, companyId :user.CompanyId, email: user.emailId };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1m' });

    res.json({ message: "Login Successful", success: true, accessToken });

  } catch (error) {
    console.error(error);
    res.json({ message: "Login Failed", success: false });
  }
});

// ResetPassword API
router.post('/resetPasswordLink', async (request,response)=>{
  const {emailId} = request.body;

  const userEmail = await RegisteredUser.findOne({emailId});

  const resetToken = crypto.randomBytes(32).toString('hex'); // to send via url.
  const hashToken = crypto.createHash("sha256").update(resetToken).digest('hex'); // to store in the database sha256 -> means cannot get the original resetToken back once hashed -> update executes the hash process and digest gets the final hashed product.
  const resetTokenExpires = Date.now() + 15*60*1000;



  const mailData = {
    from : process.env.GMAIL_PRINTNEST,
    to : 'moreprasad1836@gmail.com',
    subject : 'Reset Password Gmail',
  html: `
  <div style="background-color:#f4f6f8; padding:30px; font-family: Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      
      <!-- Header / Logo -->
      <div style="background:#0ea5a4; padding:20px; text-align:center;">
        <img 
          src="https://res.cloudinary.com/delx00uwl/image/upload/v1767788643/PrintNestUsersLogo/rda7vgi9sdc7zp9v9evk.jpg"
          alt="Print Nest Logo"
          style="max-width:120px; margin-bottom:10px;"
        />
        <h1 style="color:#ffffff; margin:0; font-size:22px;">Print Nest</h1>
      </div>

      <!-- Body -->
      <div style="padding:30px; color:#333;">
        <h2 style="margin-top:0; color:#111;">Password Reset Request</h2>

        <p style="font-size:15px;">
          Hello,
        </p>

        <p style="font-size:15px;">
          We received a request to reset the password for your <strong>Print Nest</strong> account.
          Click the button below to securely set a new password.
        </p>

        <!-- Button -->
        <div style="text-align:center; margin:30px 0;">
          <a 
            href="${process.env.CLIENT_URL}/resetPassword?token=${resetToken}"
            style="
              background:#0ea5a4;
              color:#ffffff;
              padding:14px 26px;
              font-size:15px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
              font-weight:bold;
            ">
            Reset Password
          </a>
        </div>

        <p style="font-size:14px; color:#555;">
          This link is valid for <strong>15 minutes</strong>.  
          If you didn’t request a password reset, you can safely ignore this email.
        </p>

        <p style="font-size:14px; color:#555;">
          For security reasons, never share this link with anyone.
        </p>

        <p style="margin-top:30px; font-size:15px;">
          Regards,<br/>
          <strong>Print Nest Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#777;">
        © ${new Date().getFullYear()} Print Nest. All rights reserved.<br/>
        This is an automated email. Please do not reply.
      </div>

    </div>
  </div>
  `
  }

  if(!userEmail)
  {
    return response.json({message : "No Registered User fosassund", success : false});
  }
  else
  {
    return response.json({message : "No Registered User fosassund", success : false});
    try
    {
      
      await transport.sendMail(mailData);
    //After mail is sent save the email, resetToken and password in the collection

       await resetPassword.create({resetEmailId : userEmail.emailId, resetToken : hashToken, resetTokenExpires}) // resetTokenExpires column name and field name are same then we can write in both way resetTokenExpires : resetTokenExpires or resetTokenExpires only.

      return response.json({success : true});
    } 
    catch(err)
    {
      return response.json({message : err, success : false})
    }
      
  }
 
});


router.post('/reset-password', async(request,response)=>{

  // We have stored the token in the crypt form so convert the request.body.token first in that form and then compare
  const hashedToken = crypto.createHash('sha256').update(request.body.token).digest('hex');
const data = await resetPassword.findOne({resetToken : hashedToken});
if(!data || data.resetTokenExpires < Date.now())
{
  return response.status(400).json({message : "Token Expired"});
}

// If Token is valid fetch the email from that token and update the user
const hashedPassword = await bcrypt.hash(request.body.password,10);
const updatedUser = await RegisteredUser.findOneAndUpdate({emailId : data.resetEmailId},{password : hashedPassword},{new : true});
// findoneAndUpdate and new:true will give the updated full document.

if(!updatedUser)
{
  return response.status(500).json({message : "Something Went Wrong"});
}

await resetPassword.deleteOne({_id : data._id});

const FeedbackMailData = {
  from: process.env.GMAIL_PRINTNEST, // your sender email
  to: 'moreprasad1836@gmail.com',              // user email
  subject: "Print Nest | Password Updated Successfully",
  html: `
  <div style="background-color:#f4f6f8; padding:30px; font-family: Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">

      <!-- Header / Logo -->
      <div style="background:#0ea5a4; padding:20px; text-align:center;">
        <img 
          src="https://res.cloudinary.com/delx00uwl/image/upload/v1766659880/PrintNestUsersLogo/tvjxhnrgstoxwfodbeqy.jpg"
          alt="Print Nest Logo"
          style="max-width:120px; margin-bottom:10px;"
        />
        <h1 style="color:#ffffff; margin:0; font-size:22px;">Print Nest</h1>
      </div>

      <!-- Body -->
      <div style="padding:30px; color:#333;">
        <h2 style="margin-top:0; color:#111;">Password Updated Successfully</h2>
        <p style="font-size:15px;">
          Hello,
        </p>
        <p style="font-size:15px;">
          Your password for the <strong>Print Nest</strong> account (<strong>${data.resetEmailId}</strong>) has been updated successfully.
        </p>
        <p style="font-size:15px;">
          If you did not make this change, please contact our support immediately.
        </p>

        <p style="margin-top:30px; font-size:15px;">
          Regards,<br/>
          <strong>Print Nest Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#777;">
        © ${new Date().getFullYear()} Print Nest. All rights reserved.<br/>
        This is an automated email. Please do not reply.
      </div>

    </div>
  </div>
  `
};

await transport.sendMail(FeedbackMailData);

   const payload = { id: updatedUser._id, OrgName:updatedUser.companyName, companyId :updatedUser.CompanyId, email: updatedUser.emailId };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

return response.status(200).json({message : `Password Updated Successfully for ${data.resetEmailId}`,accessToken, data:updatedUser});

});

router.post('/handleAuthLogin',(request,response)=>{
  const clientId = process.env.GOOGLE_CLIENT_ID; // CLIENT ID NEED TO ATTACH WITH THE URL REDIIRECTING from Browser to the Google first time
  const redirectUri = process.env.GOOGLE_REDIRECT_URI; // Redirect URL
  const scope = "email profile"; // We want the Email and Profile of the User
  const responseType  = "code"; // Requesting for the Code from the Google
  const accessType = "offline"; // optional if you want refresh tokens
  const prompt = "consent"; // forces user consent every time

    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=${accessType}&prompt=${prompt}`;

    return response.json({url : googleUrl});
})

router.post('/googleAuth', async (request, response) => {
  try {
    const { code } = request.body;
    if (!code) return response.status(400).json({ message: "Code is Required", status: false });

    // 1. Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    // 2. Get user profile
    const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userData = userResponse.data;

    // 3. Find/Create Company
    const hostDetails = request.headers.host;
    const hostName = hostDetails.split('.')[0];

    let CompanyDetails = await Company_Db.findOne({ CompanyName: hostName });
    if (!CompanyDetails) {
      CompanyDetails = await Company_Db.create({ companyDomain: hostDetails, CompanyName: hostName });
    }

    // 4. Find/Create User
      let registerdUserCheck = await RegisteredUser.findOne({ emailId: userData.email });
      if (!registerdUserCheck) {
      registerdUserCheck = await RegisteredUser.create({
      emailId: userData.email,
      primaryOwner: userData.name,
      isEmailVerified: userData.verified_email,
      googleId: userData.id,
      fileUrl: userData.picture,
      provider:"google",
      CompanyId: CompanyDetails._id
      });
    }


        // 5. Generate JWT
    const payload = { id: registerdUserCheck._id, OrgName:registerdUserCheck.companyName, companyId :registerdUserCheck.CompanyId, email: registerdUserCheck.emailId };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    // 6. Return response
    return response.status(200).json({ message: "Registered Successful", status: true, accessToken, data: registerdUserCheck });

  } catch (err) {
    console.error("Google Auth Error:", err.response?.data || err.message);
    const dd= db.RegisteredUsers.getIndexes()
    return response.status(500).json({ status: false, message: "Google auth failed", error : err, ds : dd });
  }
});




module.exports = router;
