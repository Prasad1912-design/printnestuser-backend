const express = require('express');
const routes = express.Router();
const checkToken = require('../../checkToken');
const askQuery = require('../../EntityClasses/afterLogin_entities/askQuery');

routes.post('/addNewQuery',checkToken, async (request,response)=>{

  if (!request.body.query) {
  return response.status(400).json({
    success: false,
    message: " Query is required."
  });
}

  try
  {

  const InsertQuery = await askQuery.create({userId : request.user.id, query : request.body.query});

    if(InsertQuery)
    {
      return response.status(200).json({success : true, message : "Your Query Successfully Submitted. We will contact you in short"});
    }
  }
  catch(e)
  {
    return response.status(500).json({success : false, message : e.message});
  }
})

module.exports = routes;