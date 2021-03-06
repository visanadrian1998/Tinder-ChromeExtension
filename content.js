const conversation_state = {
  isInConversation: false,
};

let messageReceived;
let emojiReceived;
let url;
let addedButtons = [];
let buttonMessages = [];
let buttonEmojis = [];

const createButton = (message) => {
  //RECEIVE THE MESSAGE AND EMOJI FROM POPUP
  const messageReceived = message.addmessage;
  const emojiReceived = message.addemoji;

  //CREATE BUTTON AND FILL IT WITH MESSAGE AND EMOJI
  const messageButton = document.createElement("input");
  messageButton.type = "button";
  messageButton.name = messageReceived;
  messageButton.value = emojiReceived;
  messageButton.classList.add("messageButton");

  //PUSH THE MESSAGE AND EMOJI IN ARRAYS AND UPDATE THE LOCAL STORAGE
  buttonMessages.push(messageReceived);
  buttonEmojis.push(emojiReceived);
  addedButtons.push(messageButton);
  try {
    chrome.storage.local.set({ name: buttonMessages }, function () {});
    chrome.storage.local.set({ value: buttonEmojis }, function () {});
  } catch (e) {
    console.log(e);
  }
};
const editMessage = (message) => {
  buttonMessages.map((messageToBeReplaced) => {
    if (messageToBeReplaced === message.messageToBeReplaced) {
      messageToBeReplaced = message.editMessage;
      return;
    }
  });
  addedButtons.map((messageToBeReplaced) => {
    if (messageToBeReplaced.name === message.messageToBeReplaced) {
      messageToBeReplaced.name = message.editMessage;
      return;
    }
  });
};
chrome.runtime.onMessage.addListener((message) => {
  if (message.addmessage) {
    createButton(message);
    insertAddedMessages();
  }
  if (message.removeAllButtons) {
    removeAllMessages();
    exitConversation();
  }
  if (message.removeButton) {
    addedButtons.length = 0;
    updateButtons();
    exitConversation();
  }
  if (message.sendAutomatic) {
    sendAutomaticMessage(message.sendAutomatic);
  }
  if (message.editMessage) {
    editMessage(message);
    insertAddedMessages();
  }
});
async function enterConversationSendMessage(match, message) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      //ACCESS THE MATCH CONVERSATION
      match.click();
      setTimeout(() => {
        //CHECK IF MESSAGE HAS ALREADY BEEN SO WE DON'T SEND THE MESSAGE TWO TIMES BY ERROR
        const conversationMessages = getMessagesFromConversation();
        if (conversationMessages.length == 0) {
          window.InputEvent = window.Event || window.InputEvent;
          var event = new InputEvent("input", {
            bubbles: true,
          });
          //SELECT THE MESSAGE AREA -> INSERT OUR MESSAGE -> SEND IT
          const textarea = document.getElementById("chat-text-area");
          if (textarea) {
            textarea.value = message;
            textarea.dispatchEvent(event);
          }
          //SELECT THE SUBMIT BUTTON AND SEND THE MESSAGE
          try {
            const submit = document.getElementsByClassName("chat")[0]
              ? document.getElementsByClassName("chat")[0].lastChild.lastChild
                  .lastChild
              : null;
            if (submit) {
              submit.click();
            }
          } catch (e) {
            console.log(e);
          }
        }
        resolve(match);
      }, 3000);
    }, 500);
  });
}
const sendAutomaticMessage = async (message) => {
  //SELECT ALL AVAILABLE MATCHES
  let matches = document.getElementsByClassName("matchListItem");
  if (matches.length <= 1) {
    chrome.runtime.sendMessage(
      {
        noMatches: "You have no matches:((",
      },
      function (response) {}
    );
  } else {
    //THE ITERATION STARTS FROM 1 BECAUSE ON POSITION 0 THERE ISNT A MATCH IT'S THE NUMBER OF LIKES
    for (let i = 1; i < matches.length; i++) {
      await enterConversationSendMessage(matches[i], message);
    }

    //IF THERE ARE REMAINING MATCHES THAT WERE NOT SELECTED WE ITERATE THEM AGAIN
    matches = document.getElementsByClassName("matchListItem");
    matches.length > 1 ? sendAutomaticMessage(message) : "";
  }
};

const checkForNewMatches = () => {
  // setTimeout(() => {
  //   let initialMatches = document.getElementsByClassName("matchListItem");
  //   console.log(initialMatches.length);
  // }, 1000);
  // setInterval(() => {
  //   const newMatches = document.getElementsByClassName("matchListItem");
  //   console.log(newMatches.length);
  //   if (newMatches.length !== initialMatches.length) {
  //     initialMatches = newMatches;
  //   }
  // }, 60000);
};

const runApp = () => {
  checkForNewMatches();
  window.addEventListener("click", function () {
    //IF THE URL DOESNT INCLUDE "MESSAGE" OR THE CURRENT LOCATION DOESN'T MATCH THE LAST CONVERSATION URL ->
    if (
      !window.location.href.includes("messages") ||
      url != window.location.href
    ) {
      //IT MEANS WE HAVE EXITED THE CONVERSATION SO WE ENABLE ALL THE MESSAGE BUTTONS
      conversation_state.isInConversation = false;

      // UNCOMMENT IF YOU WANT TO SEND THE MESSAGES ON CLICK->OTHERWISE DISABLING/ENABLING THE BUTTONS DOESNT MAKE SENSE
      // for (let i = 0; i < addedButtons.length; i++) {
      //   addedButtons[i].disabled = false;
      // }
    }

    //IF THE URL INCLUDES MESSAGES & WE WEREN'T IN CONVERSATION BEFORE CLICK ->
    //IT MEANS WE HAVE JUST ENTERED A CONVERSATION SO->
    if (
      window.location.href.includes("messages") &&
      !conversation_state.isInConversation
    ) {
      //WE UPDATE THE CURRENT URL AND INSERT THE BUTTONS
      conversation_state.isInConversation = true;
      url = window.location.href;
      try {
        this.setTimeout(function () {
          insertAddedMessages();
          disableButtonOnClick();
          //getMessagesFromConversation();
        }, 1500);
      } catch (e) {
        this.console.log(e);
      }
    }
  });
};
updateButtons();
runApp();

function sendMessage(message) {
  window.InputEvent = window.Event || window.InputEvent;

  var event = new InputEvent("input", {
    bubbles: true,
  });
  //SELECT THE MESSAGE AREA -> INSERT OUR MESSAGE -> SEND IT
  const textarea = document.getElementById("chat-text-area");
  textarea.value = message.name;
  textarea.dispatchEvent(event);

  // UNCOMMENT IF YOU WANT THE MESSAGE TO BE SENT ON BUTTON CLICK
  // const submit = document.getElementsByClassName(
  //   "button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($primary-gradient) button--primary-shadow StyledButton Fw($semibold) focus-button-style Mb(16px) As(fe)"
  // )[0];
  // submit.click();

  //DISABLE THE BUTTON SO WE DON'T SEND THE SAME MESSAGE TWICE
  // UNCOMMENT IF YOU WANT TO SEND THE MESSAGES ON CLICK->OTHERWISE DISABLING/ENABLING THE BUTTONS DOESNT MAKE SENSE
  //message.disabled = true;
}

function insertAddedMessages() {
  //FOR EVERY BUTTON WE SELECT THE CHATBOX AND WE INSERT THE BUTTON TO BE DISPLAYED
  const chatbox = document.getElementsByClassName("chat")[0]
    ? document.getElementsByClassName("chat")[0].lastChild
    : null;
  //ADD HEADER TEXT ABOVE BUTTONS;DISPLAY ONLY IF WE HAVE BUTTONS
  const buttonsHeader = document.createElement("p");
  buttonsHeader.textContent = "Auto messages";
  buttonsHeader.classList.add("buttonsHeader");
  addedButtons.length == 0
    ? (buttonsHeader.style.display = "none")
    : (buttonsHeader.style.display = "block");
  chatbox && chatbox.insertAdjacentElement("afterbegin", buttonsHeader);
  const conversationMessages = getMessagesFromConversation();
  for (let i = 0; i < addedButtons.length; i++) {
    addedButtons[i].disabled = false;
    try {
      chatbox.insertAdjacentElement("afterbegin", addedButtons[i]);

      addedButtons[i].style.left = `${50 * i}px`;

      //IF THE BUTTON MESSAGE EXISTS IN CONVERSATION WE DISABLE THE BUTTON
      if (conversationMessages.includes(addedButtons[i].name)) {
        addedButtons[i].disabled = true;
      }

      // UNCOMMENT IF YOU WANT TO PREVIEW MESSAGE ON BUTTON HOVER
      // addedButtons[i].onmouseover = function () {
      //   const textarea = document.getElementById("chat-text-area");
      //   textarea.value = addedButtons[i].name;
      // };
      // addedButtons[i].onmouseout = function () {
      //   const textarea = document.getElementById("chat-text-area");
      //   textarea.value = "";
      // };
      addedButtons[i].onclick = function () {
        sendMessage(addedButtons[i]);
      };
    } catch (e) {
      console.log(e);
    }
  }
}

//EMPTY THE ARRAYS AND UPDATE LOCAL STORAGE
function removeAllMessages() {
  addedButtons.length = 0;
  buttonMessages.length = 0;
  buttonEmojis.length = 0;
  chrome.storage.local.set({ name: buttonMessages });
  chrome.storage.local.set({ value: buttonEmojis });
}

//GET ALL MESSAGES FROM STORAGE
function getButtonTextFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ name: [] }, function (result) {
        resolve(result.name);
      });
    }, 0);
  });
}

//GET ALL USED EMOJIS FROM STORAGE
function getButtonEmojiFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ value: [] }, function (result) {
        resolve(result.value);
      });
    }, 0);
  });
}

//GET MESSAGES AND EMOJIS FROM STORAGE AND CREATE BUTTONS WITH THEM
async function updateButtons() {
  buttonMessages = await getButtonTextFromStorage();
  buttonEmojis = await getButtonEmojiFromStorage();
  for (let i = 0; i < buttonMessages.length; i++) {
    const messageButton = document.createElement("input");
    messageButton.type = "button";
    messageButton.name = buttonMessages[i];
    messageButton.value = buttonEmojis[i];
    messageButton.classList.add("messageButton");
    addedButtons.push(messageButton);
  }
}

function exitConversation() {
  try {
    const exit = document.getElementsByClassName("chat")[0]
      ? document.getElementsByClassName("chat")[0].children[1].lastChild
          .firstChild
      : null;
    exit.click();
  } catch (e) {
    console.log(e);
  }
}

//GET ALL THE MESSAGES FROM THE CONVERSATION
const getMessagesFromConversation = () => {
  const arrayOfMessages = [];
  const arrayOfMessageBoxes = document.getElementsByClassName("msg BreakWord");
  Array.from(arrayOfMessageBoxes).forEach((messageBox) => {
    arrayOfMessages.push(messageBox.textContent);
  });
  return arrayOfMessages;
};

//WHEN SENDING A MESSAGE CHECK IF IT WAS A PREDEFINED MESSAGE -> IF SO DISABLE THE BUTTON
const disableButtonOnClick = () => {
  const submit = document.getElementsByClassName("chat")[0]
    ? document.getElementsByClassName("chat")[0].lastChild.lastChild.lastChild
    : null;
  submit.addEventListener("click", () => {
    setTimeout(() => {
      const conversationMessages = getMessagesFromConversation();
      addedButtons.map((button) => {
        if (conversationMessages.includes(button.name)) {
          button.disabled = true;
        }
      });
    }, 500);
  });
};
