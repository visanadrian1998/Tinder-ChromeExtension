let tabId = null;
const stockEmojis = ["✪", "⚔️", "☎", "♛", "♫", "☯", "❤️"];
let changeableEmojis = ["✪", "⚔️", "☎", "♛", "♫", "☯", "❤️"];

const runApp = (tab) => {
  //CHECK IF TINDER PAGE IS OPEN IN TAB
  if (tab.url.includes("tinder.com")) {
    tabId = tab.id;
    selectElements();
    updatePopup();
  } else {
    const addAndRemoveButtons = document.getElementById("addAndRemoveButtons");
    const notOnTinder = document.getElementById("notOnTinder");

    //IF WE ARE NOT ON TINDER -> DISPLAY NOTONTINDER COMPONENT
    addAndRemoveButtons.style.display = "none";
    notOnTinder.style.display = "inline";

    //CLICKING ON LINK -> CREATE NEW TAB THAT TAKES YOU TO TINDER.COM
    const tinderLink = document.getElementById("openTinder");
    tinderLink.addEventListener("click", function () {
      chrome.tabs.create({ url: "https://tinder.com", active: true });
    });
  }
};

window.addEventListener("DOMContentLoaded", () =>
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => tabs.length && runApp(tabs[0])
  )
);

const selectElements = () => {
  addMessageButton = document.getElementById("addMessage");
  removeAllMessagesButton = document.getElementById("removeAllButtons");

  //SEND MESSAGE TO CONTENT AND IN LOCAL STORAGE SET EMOJIS TO THE STOCK ONES
  removeAllMessagesButton.addEventListener("click", function () {
    chrome.tabs.sendMessage(tabId, { remove: "remove" });
    chrome.storage.local.set({ emojis: stockEmojis }, function () {});
    window.close();
  });

  addMessageButton.addEventListener("click", function () {
    const messageContainer = document.createElement("div");

    //CREATE TEXT INPUT
    messageContainer.id = "messageContainer";
    const messageText = document.createElement("input");
    messageText.id = "textInput";
    messageText.type = "text";

    //ADD TEXT INPUT TO CONTAINER
    messageContainer.appendChild(messageText);

    //ADD CONTAINER IN FRONT OF ADD&REMOVE BUTTONS
    addMessageButton.insertAdjacentElement("beforebegin", messageContainer);

    //CREATE EMOJI SELECTOR AND LOAD THE OPTIONS WITH OUR EMOJIS
    const emojiSelector = document.createElement("select");
    emojiSelector.id = "emojiSelector";
    for (i = 0; i < changeableEmojis.length; i++) {
      const option = document.createElement("option");
      option.innerHTML = changeableEmojis[i];
      emojiSelector.add(option);
    }

    //INSERT EMOJI SELECTOR AFTER TEXT INPUT
    messageText.insertAdjacentElement("afterend", emojiSelector);

    //CREATE "SET" BUTTON
    const setMessageButton = document.createElement("input");
    //ADDMESSAGEBUTTON IS DISABLED UNTIL WE SET THE CURRENT MESSAGE
    addMessageButton.disabled = true;
    //SETMESSAGEBUTTON IS DISABLED IF THE TEXT INPUT IS EMPTY
    setMessageButton.disabled = true;
    setMessageButton.type = "button";
    setMessageButton.value = "SET!";
    setMessageButton.id = "setMessageButton";

    //INSERT SET BUTTON AFTER EMOJI SELECTOR
    emojiSelector.insertAdjacentElement("afterend", setMessageButton);
    //IF TEXT INPUT CONTAINS SOMETHING -> SET BUTTON ISN'T DISABLED;IF IT IS EMPTY->DISABLED BUTTON
    messageText.addEventListener("keyup", function () {
      messageText.value.length > 0
        ? (setMessageButton.disabled = false)
        : (setMessageButton.disabled = true);
    });

    setMessageButton.addEventListener("click", function () {
      //ENABLE THE ADD MESSAGE BUTTON WHEN WE SET THE CURRENT MESSAGE
      document.getElementById("addMessage").disabled = false;

      const message = messageText.value;
      const emoji = emojiSelector.value;
      buttonText.push(message);
      buttonEmoji.push(emoji);

      //REMOVE THE SELECTED EMOJI FROM THE ARRAY OF EMOJIS AND SET THE NEW ARRAY IN LOCAL STORAGE
      changeableEmojis = changeableEmojis.filter(
        (emoji) => emoji != emojiSelector.value
      );
      chrome.storage.local.set({ emojis: changeableEmojis }, function () {});

      //SEND THE MESSAGE AND THE EMOJI TO CONTENT
      chrome.tabs.sendMessage(tabId, { addmessage: message, addemoji: emoji });

      //TEXT INPUT AND EMOJI SELECTOR DISABLED;SET BUTTON DISSAPEARS
      messageText.readOnly = true;
      setMessageButton.style.display = "none";
      emojiSelector.disabled = true;

      //IF THERE ARE NO AVAILABLE EMOJIS THAT MEANS WE USED ALL OF THEM SO WE CAN'T ADD NO MORE MESSAGES.
      if (changeableEmojis.length == 0) {
        document.getElementById("addMessage").disabled = true;
      }
    });
  });
};

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

//GET THE USED EMOJIS FROM STORAGE
function getButtonEmojiFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ value: [] }, function (result) {
        resolve(result.value);
      });
    }, 0);
  });
}

function getEmojisFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ emojis: [] }, function (result) {
        resolve(result.emojis);
        console.log(result.emojis);
      });
    }, 0);
  });
}

async function updatePopup() {
  buttonText = await getButtonTextFromStorage();
  buttonEmoji = await getButtonEmojiFromStorage();
  changeableEmojis = await getEmojisFromStorage();

  if (buttonText.length == stockEmojis.length) {
    document.getElementById("addMessage").disabled = true;
  }

  if (changeableEmojis.length == 0 && buttonText.length == 0) {
    changeableEmojis = stockEmojis;
  }

  for (let i = 0; i < buttonText.length; i++) {
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";

    const messageText = document.createElement("input");
    messageText.type = "text";
    messageText.value = buttonText[i];
    messageText.readOnly = true;
    messageText.id = "textInput";
    messageContainer.appendChild(messageText);
    addMessageButton.insertAdjacentElement("beforebegin", messageContainer);

    const emojiSelector = document.createElement("select");
    //emojiSelector.type = "button";
    const option = document.createElement("option");
    option.innerHTML = buttonEmoji[i];
    emojiSelector.add(option);
    emojiSelector.id = "emojiSelector";
    emojiSelector.disabled = true;
    messageText.insertAdjacentElement("afterend", emojiSelector);

    var deleteFromPopup = document.createElement("input");
    deleteFromPopup.type = "button";
    deleteFromPopup.value = "×";
    deleteFromPopup.id = "deletefrompopup";
    emojiSelector.insertAdjacentElement("afterend", deleteFromPopup);

    deleteFromPopup.onclick = function () {
      changeableEmojis.push(buttonEmoji[i]);
      buttonText = buttonText.filter((name) => name != buttonText[i]);
      buttonEmoji = buttonEmoji.filter((value) => value != buttonEmoji[i]);
      chrome.storage.local.set({ name: buttonText }, function () {});
      chrome.storage.local.set({ value: buttonEmoji }, function () {});
      chrome.storage.local.set({ emojis: changeableEmojis }, function () {});
      chrome.tabs.sendMessage(tabId, { removebutton: "remove" });

      window.close();
    };
  }
}
