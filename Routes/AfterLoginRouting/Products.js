const express = require('express');
const router = express.Router();
const checkToken = require('../../checkToken');
const Category = require('../../EntityClasses/afterLogin_entities/Category');
const products = require('../../EntityClasses/afterLogin_entities/products');
const cartCollection = require('../../EntityClasses/afterLogin_entities/cartCollection');
const { SchemaTypeOptions } = require('mongoose');
const getDistance = require('../../utility/distanceCalculator');
const RegisteredUser = require('../../EntityClasses/beforeLogin_entites/RegisteredUser');
const {calculateShippingDetails} = require('./calculateShipping');

router.get('/getCategory', async (request,response)=>{
  try
  {
    const categories = await Category.find({isActive : true});
    return response.status(200).json({success : true, details : categories});
  }
  catch(error)  
  {
    return response.status(500).json({message : error, success : false});
  }
  });

router.get('/getProducts', checkToken, async (request,response)=>{
  const {slug} = request.query;
  // return response.json({data : slug});

  const categoryId = await Category.findOne({slug});
  if(!categoryId)
  {
    return response.status(404).json({message : "No Category is Active"});
  }

  const productDetails = await products.find({categoryId:categoryId._id});

  if(!productDetails)
  {
    return response.status(404).json({message :"NO Product Active"});
  }

  return response.status(200).json({success : true, data : productDetails});
})

router.get('/getProduct/:ids/:pName', checkToken, async (request, response) => {
  try {
    const { ids, pName } = request.params;

    const details = await products.findOne({ _id: ids });
    const alsoConsider = await products.find({ _id: { $ne: ids } });

    if (!details) {
      return response.status(401).json({ success: false, message: `${pName} is currently Unavailable.` });
    }

    return response.status(200).json({ success: true, message: `${pName} List...`, data: details, alsoConsider });
  } catch (error) {
    return response.status(500).json({ success: false, message: error });
  }
});

router.post('/add-to-cart',checkToken, async (request,response)=>{

  const userId = request.user.id;
  const productId = request.body.productId;
  const qty = parseInt(request.body.qty, 10);
    
  const cartDetail = await cartCollection.findOne({productId,userId});
  if(cartDetail)
    {
      cartDetail.qty = cartDetail.qty + qty;
      await cartDetail.save();
      const totalCartItems = await cartCollection.countDocuments({ userId });      
      return response.status(200).json({cartDetail, success : true, totalCartItems});
    }
    
    const newCartData = await cartCollection.create({userId, productId, qty});   
    const totalCartItems = await cartCollection.countDocuments({ userId });
    return response.status(200).json({newCartData, success : true, totalCartItems});
});


router.get('/get-cart-count', checkToken, async (request, response) => {
  try {
    const userId = request.user.id;

    if (!userId) {
      return response.status(400).json({ success: false, message: "User ID not found" });
    }

    const totalCartItems = await cartCollection.countDocuments({ userId });

    // Always return a number, even if 0
    return response.status(200).json({ success: true, totalCartItems });
  } catch (error) {
    return response.status(500).json({ success: false, message: error.message });
  }
});

router.get('/getCartDetails',checkToken, async (request,response)=>{
  try
  {
  const userId = request.user.id;

    const cartDetail = await cartCollection.find({userId}).populate('productId');

  if(cartDetail.length === 0)
  {
    return response.status(200).json({success : true, data: cartDetail || []});
  }

  return response.status(200).json({success : true, data : cartDetail});
  }
  catch(err)
  {
    return response.status(500).json({data : err});
  }
});

router.post('/decreaseCartQty', checkToken, async (req, res) => {
  try {
    const { id } = req.body;

    const cartItem = await cartCollection.findById(id);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    cartItem.qty = Math.max(cartItem.qty - 1, 0);
    await cartItem.save();

    // Optional: Remove from cart if qty is 0
    if (cartItem.qty === 0) {
      await cartCollection.deleteOne({ _id: id });
    }

    return res.status(200).json({ success: true, qty: cartItem.qty });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/increaseCartQty',checkToken, async (request,response)=>{
  try
  {
    const {id} = request.body;
    
    const cartItem = await cartCollection.findOne({_id : id});

    if(!cartItem)
    {
      return response.status(200).json({success : true, message : " NO Products Available"});
    }

    cartItem.qty = cartItem.qty + 1;
    await cartItem.save();

    if(cartCollection.qty === 0)
    {
      await cartCollection.deleteOne({_id : id});
    }

    return response.status(200).json({success : true, qty : cartItem.qty});
  }
  catch(err)
  {
    return response.status(500).json({message : err});
  }
})

router.post('/deleteCartItem',checkToken, async (request,response)=>{
  try{

    const {id} = request.body;
    
    const updatedCart = await cartCollection.deleteOne({_id : id});
    if(updatedCart.deletedCount )
  {
    return response.status(200).json({success : true, message : "Not Possible"});
  }
  return response.status(200).json({success : true});
}
catch(error)
{
  return response.status(500).json({message : error});
}
});

router.get('/getShippingAddress/',checkToken, async(request,response)=>{
  const shippingAddress = await calculateShippingDetails(request.user.id);
  return response.status(200).json({shippingAddress : shippingAddress.address, distance : shippingAddress.distance, status : true});
});

router.post('/changeShippingAddress', checkToken, async (request, response) => {
  try {
    const newAddress = request.body.newAddress;

    // ✅ Validate input
    if (!newAddress || typeof newAddress !== "string" || newAddress.trim() === "") {
      return response.status(400).json({ success: false, message: "Invalid address" });
    }

    // ✅ Update DB and get updated user
    const updatedUser = await RegisteredUser.findByIdAndUpdate(
      request.user.id,
      { companyAddress: newAddress },
      { new: true } // returns the updated document
    );

    if (!updatedUser) {
      return response.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Return updated address for frontend state update
    return response.status(200).json({
      success: true,
      message: "Shipping address updated successfully",
      shippingAddress: updatedUser.companyAddress
    });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ success: false, message: "Server error" });
  }
});



  module.exports = router;
