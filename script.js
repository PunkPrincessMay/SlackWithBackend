// Name: Katie Summers;
// Description: This JS file runs the chat application;

// Sets up variables used in multiple functions;
chatContainer = document.getElementById("chat-messages");
let userInput = document.querySelector("#message-input").value.trim();

// This function changes the active channel when the user clicks it;
function changeChannel(e) {
  document.querySelector(".active").classList.remove("active");
  e.currentTarget.classList.add("active");
  populateMessages(e.currentTarget.getAttribute("data-channel"));
  document.querySelector("#channel-title").innerText =
    e.currentTarget.innerText;
}

// This function populates the messages for the active channel;
async function populateMessages(chat) {
  // document.querySelectorAll(".message").forEach((item) => item.remove());
  let template = document.querySelector("template");
  // The chat parameter will recieve the chat ID for the current channel;
  chatContainer.innerHTML = "";
  let getMessages = await fetch(`https://slackclonebackendapi.onrender.com/messages?channelId=${chat}`).then(res=>res.json());
  getMessages.forEach(async(message) =>{
    const clone = template.content.cloneNode(true);
    const sender = await fetch(`https://slackclonebackendapi.onrender.com/users?id=${message.senderId}`).then(res=>res.json());
    sender.forEach((user) =>{
        message.name = user.name;
    });
    clone.querySelector(".sender").textContent = message.name + ":";
    if (userInput === ""){
      clone.querySelector(".text").textContent = message.content;
    };
    document.querySelector("#chat-messages").appendChild(clone);
  });
}

// This function sends a message to the backend and then repopulates the messages for the active channel;
async function sendMessage() {
  let input = document.querySelector("#message-input");
  let text = input.value.trim();
  const activeChannel = document.querySelector(".active").dataset.channel;
  const user = await fetch(`https://slackclonebackendapi.onrender.com/users`).then((res) => res.json());
  const randomUser = user[Math.floor(Math.random() * user.length)];
  const newMessage = {
   channelId: activeChannel,
   senderId: randomUser.id,
   content: text
 };

  await fetch(`https://slackclonebackendapi.onrender.com/messages`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(newMessage)
  });

  input.value = "";
  populateMessages(activeChannel);
}
document.querySelector(".chat-input>button").addEventListener("click", sendMessage);

// This function initializes the application by fetching the channels from the backend and creating buttons for each channel;
async function init(){
   try{
    let result = await fetch("https://slackclonebackendapi.onrender.com/channels").then(res=>res.json());
    result.forEach((item) =>{
      const button = document.createElement("button");
      button.classList.add("channel");
      // Set the data-channel attribute to the id of each object;
      button.setAttribute("data-channel", item.id);
      // Set the innerText to the name of the object;
      button.innerText = item.name;
      document.querySelector("#channel-title").appendChild(button);
      // Append the button to the HTML element with the class channel-list;
      document.querySelector(".channel-list").appendChild(button);
      document.querySelector(".channel").classList.add("active");
    });
   }catch(err){
    console.log(err);
   }
    document
      .querySelectorAll(".channel")
      .forEach((item) => item.addEventListener("click", changeChannel));
  
}

init();