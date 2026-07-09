import { useEffect, useState } from "react";
import API from "../api";

export default function ChatList() {

  const [chats, setChats] = useState([]);

  const user = JSON.parse(
    localStorage.getItem("user")
  );


  useEffect(() => {

    if (!user?._id) {
      console.log("No user found");
      return;
    }


    API
      .get(`/api/chat/chats/${user._id}`)
      .then((res)=>{
        console.log(
          "Chats:",
          res.data
        );

        setChats(res.data);
      })
      .catch((err)=>{
        console.log(
          "Chat error:",
          err.response?.data || err.message
        );
      });


  }, [user?._id]);


  return (

    <div>

      <h2>
        Chats 💬
      </h2>


      {
        chats.length === 0 ?

        (
          <p>
            No chats found
          </p>
        )

        :

        chats.map((chat)=>(

          <div key={chat._id}>

            Chat ID:
            {" "}
            {chat._id}

          </div>

        ))

      }


    </div>

  );
}