const express = require('express');
const router = express.Router();

const user = require('../../EntityClasses/user');
const demoUser = require('../../EntityClasses/demo');
const embeddedUSer = require('../../EntityClasses/embedding');

const author = require('../../EntityClasses/one');
const book = require('../../EntityClasses/Many');

const data = {
  name : "Prasad",
  age : 25
}

router.post('/demoTrial',async (request,response)=>{
  try
  {
  const datas = await demoUser.create(data);  
  console.log(datas);
  response.json({datas});
  }
  catch(e)
  {
    console.log("Error is : " + e);
  }
});


router.get('/getDemo',async (request,response)=>{
  try
  {
    let datas =await  demoUser.find();
    datas = datas.filter(e=>e.age>20);
    response.json(datas);
    
  }
  catch(e)
  {
    console.log("Error " + e);
    response.json(e);
  }
})



router.get('/fetchSingle',async (request,response)=>{
  try
  {
    const data = await demoUser.findOne({age : {$gt : 20}}).select('name age -_id'); // By default at every time even if we specify the columns mongo sends the _id along with it so to skip it we use -_id  (No space)
    if(data===null)
    {
      return response.json("No Data");
    }
    response.json(data);
  }
  catch(e)
  {

  }
})


router.get('/fetchUser',async (request,response)=>{
  const data = await demoUser.find({age:{$lt:40}, name : {$ne:'Harish'}}).select("name age -_id");

  response.json({data});
})

router.get('/nameIn',async (request,response)=>{
  const data = await demoUser.find({name : {$in:['Prasad', 'Ganesh']}});
  response.json({data});
})

router.get('/ageOrName',async (request,response)=>{
  const data = await demoUser.find({$or : [{age : {$lt : 25}} , {name : {$eq : 'Prasad'}}]});
  response.json({data});
})



router.get('/ageAndName',async (request,response)=>{
  const data = await demoUser.find({$and : [{age : {$gte : 25}}, {name : {$eq : 'Snehal'}}]});
  response.json({data});
})

router.get('/nameNotIn',async (request,response)=>{
  const data = await demoUser.find({name:{$nin : ['Prasad', 'Ganesh']}});
  response.json({data});
})

router.get('/ageAndNameNotIn',async (requesr,response)=>{
  const data = await demoUser.find({$and : [{age : {$gte : 20}}, {name : {$nin : ['Harish','Prasad']}}]});
  response.json({data});
})

router.get('/first5Users',async (request,response)=>{
  const data = await demoUser.find().limit(5);
  response.json({data});
})


router.get('/page/:page',async(request,response)=>{
  const pages = parseInt(request.params.page) || 1;
  const perPage = 5;
    const data = await demoUser.find().skip((pages - 1)*perPage).limit(perPage);
    response.json({data})
})

router.put('/updateAge',async(request,response)=>{
  const data = await demoUser.updateOne({$and : [{name : {$eq : "Prasad"}}]},{$set : {age : 22}});
  response.json({data});
}) // updateOne will update only first record with the matching name = Prasad &
// updateMany will update all the records matching the condition.

router.delete('/deleteRecords', async(request,response)=>{
  const data = await demoUser.deleteOne({$and : [{name : {$eq : 'Prasad'}}, {age : {$lt : 25}}]});

  console.log(data);
  response.json({data});
})




router.get('/namePattern',async (request,response)=>{
  const data = await demoUser.find({name : {$regex : "^S"}})
  response.json({data});
})




router.get('/user_data', async (request, response) => {
  try {
    const data = await user.findOne({email : 'hari@gmail.com'},{name : 'Harish'});
    response.status(201).json({ data: data });
  } catch (error) {
    response.status(400).json(error);
  }
});






  // Validation 
  router.post('/validateDemo', async (request,response)=>{
    try
    {
    const data = await demoUser.create(request.body);
    response.json({data});
    console.log(data);
    }
    catch(error)
    {
      console.log(error);
    }
  })



// Embedded
router.post('/embedded',async (request,response)=>{
  const data = await embeddedUSer.create(request.body);
  response.json({data});
  console.log(data);
})

router.get('/fetchEmbedded',async (request,response)=>{
  const data = await embeddedUSer.find();
  response.json({data});
  console.log(data);
})

router.get('/getAuthorPrasad', async (request,response)=>{
  const data = await embeddedUSer.findOne({name : {$eq : "Ganesh Author"}}).select("name Book1 -_id");
  response.json({data : data.Book1[0]});
  console.log(data);
})

router.get('/fetchBooks', async (request,response)=>{
  const data = await embeddedUSer.find().select("Book1 -_id");
  response.json({data});
  console.log(data);
})

router.get('/getSlice', async (request,response)=>{
  const data = await embeddedUSer.find().select({Book1 : {$slice : [0,1]}, _id:0}); // excludng the _id with 0 Include by 1 exclude by 0.
  response.json({data});
  console.log(data);
})


router.put('/updateAuthorName',async (request,response)=>{
  const data = await embeddedUSer.updateOne({name : "Ganesh Authot"},{$set : {name : "Ganesh Author", "Book1.0.name" : "Santtor"}});

  response.json({data});
})

//Delet the particular book
router.delete('/deleteBook1',async (request,response)=>{
  const data = await embeddedUSer.updateOne({name : {$eq : "Ganesh Author"}}, {$pull : {Book1 : {name : {$eq : "Santtor"}}}});
  response.json({data});
  console.log(data);
})


// One to many where Author Model is the parent and the Book Model is the Child.

router.post('/addAuthor',async (request,response)=>{
      const data = await author.create(request.body);
      response.json({data});
      console.log(data);
})

router.post('/addBook', async (request,response)=>{
  const authorId = await author.findOne({name : {$eq : request.body.authorName}}).select("_id");
  if(!authorId)
  {
    return response.json("No Author Found");
  }
  request.body.author = authorId._id;
  delete request.body.authorName; // delete the author name column because we dont require the name we want Id which we fetched from this field.
  const data = await book.create(request.body);
  response.json({data});
  console.log(data);
})

// Optional Best for the Above without the Autor Name in the Collection Schema Design
router.post('/addBookNew', async (request,response)=>{
  const {name, price, topic, authorName} = request.body;

  if(!authorName) // To not Empty The Author Name Field / Drop Down Box we want the Author Name Compulsary.
  {
    return response.json("Author Name is Required...!!!");
  }
  
  const authorId = await author.findOne({name : {$eq : authorName}}).select('_id');

  if(!authorId)
  {
    return response.json("No Author Found...!!!");
  }

  const bookData = {
    name,
    price,
    topic,
    author : authorId._id
  }

  const data = await book.create(bookData);

  response.status(201).json({data});
  console.log(data);
})

// Select
router.post('/getBook',async (request,response)=>{
  const data = await book.findOne({price : {$gte : request.body.price}}).select("name price -_id").populate("author","name Country -_id") // The first Parameter in the .populate is the field name and the second parameter is the field names of the parent table.
  response.json({data});

  // Here above even I said that I want the name and price field I will get the author Field also because the .populate will execute before the .select (.select -> means give me only selected field). populate gets the field from mongoose not from the .select() result.

  // For Multiple .populate you can use .populate().populate().populate()... n times.

  // Delete the Parent -> will affect the child.
})


  router.delete('/deleteAuthor', async (request,response)=>{

    const {authorName} = request.body; // Fetching the Author Name from the request body. 
    // If you are using the {} for the variable name then the variable name should be the same as the request.body is comming.

    if(!authorName)
    {
      return response.json("Author Compulsary Required...");
    }

    const authorId =  await author.findOne({name : {$eq : authorName}}).select('_id');

    if(!authorId)
    {
      return response.json("No Author Found...!!!");
    }

    // If Author Found Please delete the child befor the Author is deleted.
    const childBookDeleted = await book.deleteMany({author : {$eq : authorId._id}});
    const parentAuthorDeleted = await author.deleteOne({_id : {$eq :authorId._id}});

    return response.json({
      message_Book : "Book Deleted Successfully...",
      deletedBookCounts : childBookDeleted.deletedCount,
      message_Author : "Author Deleted Successfully...",
      deletedAuthorCounts : parentAuthorDeleted.deletedCount
    })

  })


  // Delete Mechanisum with the Cascade
  // If you want to delete by using cascade you can use either findAndDelete -> provide id, name or any field you have
  // but If you want to delete only by id is confirmed then use findByIdAndDelete
  // If you try to use deleteOne, deleteMany It will not work for the delete cascade middleware.
  // If you try to use the deleteOne, deleteMany then you have to delete the child books manually.
  router.delete('/deleteByIdConfirmed', async (request,response)=>{
    const {deleteAuthorId} = request.body;

    if(!deleteAuthorId)
    {
      return response.json("Author Compulsary Required...!!!");
    }

    const authorDeleted = await author.findOneAndDelete({_id : deleteAuthorId}); // at this movement the delete cascade declared in the parent will be triggered. and also we are confirm that we will perform operations on the id basis so we have used the findByIdAndDelete. If we want to perform operation on the basis of the name or any other field then we use findAndDelete.
    if(!authorDeleted)
    {
      return response.json("No Author Found...!!!");
    }

    return response.json({
      message : "Author and the Related Books Deleted Successfully",
      authorDeleted
    });

  })

  // I have done with the cascade delete We can use for update also but It is waste because in the child we are storing the _id which is unique and non updatebale so even the name of the author updates we can get the latest name by using the id. Update of the parent does'nt harm the child.











module.exports = router;
