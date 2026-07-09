const express = require("express");
const router = express.Router();

const auth = require("../Middleware/authmiddleware");
const MessageRequest = require("../models/MessageRequest");
const Match = require("../models/Match");


// SEND MESSAGE REQUEST
router.post("/:userId", auth, async(req,res)=>{

try{

const sender=req.user.id;
const receiver=req.params.userId;
const {text}=req.body;


let request = await MessageRequest.findOne({
 sender,
 receiver,
 status:"pending"
});


if(!request){

request = await MessageRequest.create({
 sender,
 receiver,
 messages:[
  {
   text
  }
 ]
});

}else{

if(request.messages.length >=3){

return res.status(400).json({
message:"You reached the 3 message limit"
});

}


request.messages.push({
 text
});

await request.save();

}


res.json(request);


}catch(err){

res.status(500).json({
message:err.message
});

}

});



// ACCEPT REQUEST

router.put("/accept/:id",auth,async(req,res)=>{

try{

const request =
await MessageRequest.findById(req.params.id);


request.status="accepted";

await request.save();



await Match.create({

users:[
request.sender,
request.receiver
]

});


res.json({
message:"Accepted"
});


}catch(err){

res.status(500).json({
message:err.message
});

}

});



module.exports=router;