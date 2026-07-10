require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// Models
const Message = require("./models/Message");
const Notification = require("./models/Notification");

// App
const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ================= CORS =================

const allowedOrigins = [
  "http://localhost:3000",
  "https://swipe-up-o7wx.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }

    },
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// ================= SERVER =================

const server = http.createServer(app);


// ================= SOCKET.IO =================

const io = new Server(server, {

  cors: {
    origin: "*",
    methods:[
      "GET",
      "POST"
    ]
  }

});


app.set("io", io);


// Online users

const onlineUsers = new Map();



// ================= SOCKET EVENTS =================

io.on("connection",(socket)=>{


console.log(
"⚡ Connected:",
socket.id
);



socket.on(
"addUser",
(userId)=>{

onlineUsers.set(
userId,
socket.id
);


io.emit(
"onlineUsers",
Array.from(onlineUsers.keys())
);

});



socket.on(
"join_room",
(roomId)=>{

socket.join(roomId);

});



socket.on(
"typing",
({roomId,userId})=>{

socket
.to(roomId)
.emit(
"typing",
userId
);

});



socket.on(
"stop_typing",
(roomId)=>{

socket
.to(roomId)
.emit(
"stop_typing"
);

});




// SEND MESSAGE

socket.on(
"send_message",
async(data)=>{


try{


const {
roomId,
sender,
receiverId,
message,
image,
audio,
video,
tempId
}=data;



if(!roomId || !sender)
return;



let type="text";


if(image)
type="image";

if(audio)
type="audio";

if(video)
type="video";



const newMessage =
await Message.create({

chatId:roomId,

sender,

message:
message || "",

image:
image || "",

audio:
audio || "",

video:
video || "",

type,

status:"delivered"

});



io.to(roomId)
.emit(
"receive_message",
{
...newMessage._doc,
tempId
}
);



// Notification

if(receiverId){


await Notification.create({

userId:receiverId,

senderId:sender,

type:"message",

text:"New message 💬"

});



const receiverSocket =
onlineUsers.get(receiverId);



if(receiverSocket){

io.to(receiverSocket)
.emit(
"new_notification",
{
type:"message",
text:"New message 💬"
}
);

}


}



}catch(err){

console.log(
"Message error:",
err.message
);

}


});




// DISCONNECT

socket.on(
"disconnect",
()=>{


for(
const [userId,socketId]
of onlineUsers
){

if(socketId===socket.id){

onlineUsers.delete(userId);

break;

}

}



io.emit(
"onlineUsers",
Array.from(onlineUsers.keys())
);


});



});




// ================= ROUTES =================


app.use(
"/api/auth",
require("./routes/AuthRoutes")
);


app.use(
"/api/user",
require("./routes/userRoutes")
);


app.use(
"/api/match",
require("./routes/MatchRoutes")
);


app.use(
"/api/chat",
require("./routes/ChatRoutes")
);


app.use(
"/api/upload",
require("./routes/uploadRoutes")
);


app.use(
"/api/notifications",
require("./routes/notificationRoutes")
);


app.use(
"/api/moments",
require("./routes/momentRoutes")
);


// NEW MESSAGE REQUEST SYSTEM

app.use(
"/api/message-request",
require("./routes/MessageRequestRoutes")
);




// ================= TEST =================

app.get("/",(req,res)=>{

res.json({

status:"OK",

message:"🔥 SwipeUp API Running"

});

});




// ================= DATABASE =================


mongoose
.connect(process.env.MONGO_URI)

.then(()=>{

console.log(
"✅ MongoDB Connected"
);

})

.catch((err)=>{

console.log(
"Mongo Error:",
err.message
);

});




// ================= START =================

const PORT =
process.env.PORT || 5000;


server.listen(
PORT,
"0.0.0.0",
()=>{

console.log(
`🚀 Server running on port ${PORT}`
);

});