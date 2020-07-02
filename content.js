// const conversation_state = {
//   isInConversation: false,
// };

// let messageReceived;
// let emojiReceived;
// let url;
// let addedButtons = [];
// let buttonMessages = [];
// let buttonEmojis = [];

// const createButton = (message) => {
//   const messageReceived = message.addmessage;
//   const emojiReceived = message.addemoji;
//   const messageButton = document.createElement("input");
//   messageButton.type = "button";
//   messageButton.message = messageReceived;
//   messageButton.emoji = emojiReceived;
//   messageButton.classList.add("buton");

//   buttonMessages.push(messageReceived);
//   buttonEmojis.push(emojiReceived);
//   addedButtons.push(messagebtn);
//   try {
//     chrome.storage.local.set({ messages: buttonMessages }, function () {});
//     chrome.storage.local.set({ usedEmojis: buttonEmojis }, function () {});
//   } catch (e) {
//     console.log(e);
//   }
// };

// chrome.runtime.onMessage.addListener((message) => {
//   if (message.addmessage) {
//     createButton(message);
//     insertAddedMessages();
//   }
//   if (message.removeAllButtons) {
//     removeAllMessages();
//     exitConversation();
//   }
//   if (message.removebutton) {
//     addedButtons.length = 0;
//     updateButtons();
//     exitConversation();
//   }
// });

// const runApp = () => {
//   window.addEventListener("click", function () {
//     if (
//       !window.location.href.includes("messages") ||
//       url != window.location.href
//     ) {
//       conversation_state.isInConversation = false;
//       for (let i = 0; i < addedButtons.length; i++) {
//         addedButtons[i].disabled = false;
//       }
//     }

//     if (
//       window.location.href.includes("messages") &&
//       !conversation_state.isInConversation
//     ) {
//       conversation_state.isInConversation = true;
//       url = window.location.href;
//       try {
//         this.setTimeout(function () {
//           insertAddedMessages();
//         }, 500);
//       } catch (e) {
//         this.console.log(e);
//       }
//     }
//   });
// };
// updateButtons();
// runApp();

// function sendMessage(message) {
//   window.InputEvent = window.Event || window.InputEvent;

//   var event = new InputEvent("input", {
//     bubbles: true,
//   });

//   const textarea = document.getElementById("chat-text-area");
//   textarea.value = message;
//   textarea.dispatchEvent(event);
//   const submit = document.getElementsByClassName(
//     "button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($primary-gradient) button--primary-shadow StyledButton Fw($semibold) focus-button-style Mb(16px) As(fe)"
//   )[0];
//   submit.click();
//   message.disabled = true;
// }

// function insertAddedMessages() {
//   for (let i = 0; i < addedButtons.length; i++) {
//     try {
//       const chatbox = document.getElementsByClassName(
//         "D(f) W(100%) BdT Bdtc($c-divider) Bgc(#fff) Pos(r)"
//       )[0];
//       chatbox.insertAdjacentElement("afterbegin", addedButtons[i]);

//       addedButtons[i].style.left = `${35 * i}px`;

//       addedButtons[i].onclick = function () {};
//     } catch (e) {
//       console.log(e);
//     }
//   }
// }

// function removeAllMessages() {
//   addedButtons.length = 0;
//   buttonMessages.length = 0;
//   buttonEmojis.length = 0;
//   chrome.storage.local.set({ name: buttonMessages });
//   chrome.storage.local.set({ value: buttonEmojis });
// }

// function getButtonTextFromStorage() {
//   return new Promise(function (resolve, reject) {
//     setTimeout(function () {
//       chrome.storage.local.get({ name: [] }, function (result) {
//         resolve(result.name);
//       });
//     }, 0);
//   });
// }
// function getButtonEmojiFromStorage() {
//   return new Promise(function (resolve, reject) {
//     setTimeout(function () {
//       chrome.storage.local.get({ value: [] }, function (result) {
//         resolve(result.value);
//       });
//     }, 0);
//   });
// }

// async function updateButtons() {
//   buttonMessages = await getButtonTextFromStorage();
//   buttonEmojis = await getButtonEmojiFromStorage();
//   for (let i = 0; i < buttonMessages.length; i++) {
//     var messagebtn = document.createElement("input");
//     messagebtn.type = "button";
//     messagebtn.name = buttonMessages[i];
//     messagebtn.value = buttonEmojis[i];
//     messagebtn.classList.add("buton");
//     addedButtons.push(messagebtn);
//   }
// }

// function exitConversation() {
//   try {
//     const exit = document.getElementsByClassName(
//       "C($c-divider) Bdc($c-divider) Bdc($c-gray):h C($c-gray):h Bdrs(50%) Bds(s) Bdw(3px) Trsdu($fast) Trsp($transform) Rotate(-90deg):h--ml close P(0) Lh(1) Cur(p) focus-button-style"
//     )[0];
//     exit.click();
//   } catch (e) {
//     console.log(e);
//   }
// }
