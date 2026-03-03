const express = require('express')
const router = express.Router();
const checkToken = require('../../checkToken');
const bcrypt = require('bcrypt');
const Category = require('../../EntityClasses/afterLogin_entities/Category');

const RegisteredUser = require('../../EntityClasses/beforeLogin_entites/RegisteredUser');
const productEntity = require('../../EntityClasses/afterLogin_entities/products');


router.post('/uploadCategory', async (request,response)=>{

  const res = await Category.create(request.body);
  if(res)
  {
    return response.json({message : "Data entered"});
  }
});


router.post('/uploadProducts', async (request,response)=>
{
  const res = await productEntity.create(request.body);

  if(res)
  {
    return response.json({message : "Data eneterd"})
  }
})

router.post('/confirmPassword',checkToken, async (request,response)=>{
  const {currentpass, newPassword} = request.body;

  const user = await RegisteredUser.findById(request.user.id).select('+password');
  // .select('+password') is required if your schema hides password by default (select: false).

  if(!user)
  {
    return response.status(403).json({message : "USER NOT FOUND"});
  }
  
  const userPassword = await bcrypt.compare(currentpass, user.password);
  
  if(!userPassword)
  {
    return response.status(401).json({message : "No Old Password Matches"});
  }

  const samePassword = await bcrypt.compare(newPassword, user.password);

  if(samePassword)
  {
    return response.status(401).json({message : "Old and New password cannot be same"});
  }

  return response.status(200).json({success : true, message : "Old Password Matches Successfully"});
})

router.post('/changePass',checkToken, async (request,response)=>{
  const {newPassword} = request.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const changePassword = await RegisteredUser.findByIdAndUpdate({_id:request.user.id},{password:hashedPassword});
  if(!changePassword)
  {
    return response.status(401).json({message : "Something Went Wrong..."});
  }
  return response.status(200).json({success : true, message : "Password Changed Successfully"});
})

router.post('/confirmUserProvider',checkToken, async (request,response)=>{    
  const userProvider = await RegisteredUser.findById(request.user.id).select('provider -_id');

  if(!userProvider)
  {
    return response.status(401).json({message : "NO Provider for the User"});
  }

  return response.status(200).json({success : true, provider : userProvider.provider, message : "Provider Found"});

})

module.exports = router;