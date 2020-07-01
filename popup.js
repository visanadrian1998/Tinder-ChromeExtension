let tabId = null;
const stockEmojis = ["✪", "⚔️", "☎", "♛", "♫", "☯", "❤️"];
let changeableEmojis = ["✪", "⚔️", "☎", "♛", "♫", "☯", "❤️"];

const runApp = (tab) => {
  //CHECK IF TINDER PAGE IS OPEN IN TAB
  if (tab.url.includes("tinder.com")) {
    const tabId = tab.id;
    selectElements();
    updatePopup();
  } else {
    const addAndRemoveButtons = document.getElementById("addAndRemoveButtons");
    const notOnTinder = document.getElementById("notOnTinder");

    //IF WE ARE NOT ON TINDER -> DISPLAY NOTONTINDER COMPONENT
    addAndRemoveButtons.style.display = "none";
    notOnTinder.style.display = "inline";

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
  const addMessageButton = document.getElementById("addMessage");
  const removeAllMessagesButton = document.getElementById("removeAllButtons");

  removeAllMessagesButton.addEventListener("click", function () {
    chrome.tabs.sendMessage(tabId, { remove: "remove" });
    chrome.storage.local.set({ emojis: stockEmojis }, function () {});
    window.close();
  });

  addMessageButton.addEventListener("click", function () {
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    const messageText = document.createElement("input");
    messageText.id = "textInput";
    messageText.type = "text";

    messageContainer.appendChild(messageText);
    addMessageButton.insertAdjacentElement("beforebegin", messageContainer);

    const emojiSelector = document.createElement("select");
    emojiSelector.id = "emojiSelector";
    for (i = 0; i < changeableEmojis.length; i++) {
      const option = document.createElement("option");
      option.innerHTML = changeableEmojis[i];
      emojiSelector.add(option);
    }

    messageText.insertAdjacentElement("afterend", emojiSelector);

    const setMessageButton = document.createElement("input");
    addMessageButton.disabled = true;
    setMessageButton.disabled = true;
    setMessageButton.type = "button";
    setMessageButton.value = "SET!";
    setMessageButton.className = "addbutton";
    setMessageButton.id = "setMessageButton";
    emojiSelector.insertAdjacentElement("afterend", setMessageButton);
    messageText.addEventListener("keydown", function () {
      messageText.value.length > 0 ? (setMessageButton.disabled = false) : "";
    });

    setMessageButton.addEventListener("click", function () {
      document.getElementById("addMessage").disabled = false;
      const message = messageText.value;
      const emoji = emojiSelector.value;
      buttonText.push(message);
      buttonEmoji.push(emoji);
      changeableEmojis = changeableEmojis.filter(
        (emoji) => emoji != emojiSelector.value
      );
      chrome.storage.local.set({ emojis: changeableEmojis }, function () {});
      chrome.tabs.sendMessage(tabId, { addmessage: message, addemoji: emoji });
      setMessageButton.disabled = true;
      messageText.readOnly = true;
      // messagebtn.classList.add("disappear");
      emojiselector.disabled = true;
      if (emojis.length == 0) {
        document.getElementById("add").disabled = true;
      }
    });
  });
};

function getButtonTextFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ name: [] }, function (result) {
        console.log(result.name);
        resolve(result.name);
      });
    }, 0);
  });
}

function getButtonEmojiFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ value: [] }, function (result) {
        console.log(result.value);
        resolve(result.value);
      });
    }, 0);
  });
}

function getEmojisFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ emojis: [] }, function (result) {
        console.log(result.emojis);
        resolve(result.emojis);
      });
    }, 0);
  });
}

async function updatePopup() {
  buttonText = await getButtonTextFromStorage();
  buttonEmoji = await getButtonEmojiFromStorage();
  changeableEmojis = await getEmojisFromStorage();

  if (buttonText.length == stockEmojis.length) {
    document.getElementById("add").disabled = true;
  }

  if (changeableEmojis.length == 0 && buttonText.length == 0) {
    changeableEmojis = stockEmojis;
  } /*else{
      if(emojis.length==0){
        emojis=predefinedemojis.filter(emoji => !buttonvalue.includes(emoji));
      }
    }*/

  for (let i = 0; i < buttonText.length; i++) {
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";

    const messageText = document.createElement("input");
    messageText.type = "text";
    messageText.value = buttonText[i];
    messageText.readOnly = true;
    messageText.id = "storagetext";

    messageContainer.appendChild(messageText);
    addMessageButton.insertAdjacentElement("beforebegin", messageContainer);

    const emojiSelector = document.createElement("input");
    emojiSelector.type = "button";
    emojiSelector.value = buttonvalue[i];
    emojiSelector.id = "emoji";
    messageText.insertAdjacentElement("afterend", emojiselector);

    var deleteFromPopup = document.createElement("input");
    deleteFromPopup.type = "button";
    deleteFromPopup.value = "×";
    deleteFromPopup.id = "deletefrompopup";
    emojiSelector.insertAdjacentElement("afterend", deletefromPopup);

    deletefromPopup.onclick = function () {
      //console.log(buttonname);
      //if(emojis.length>=predefinedemojis.length){
      changeableEmojis.push(buttonEmoji[i]);
      //emojis=emojis.filter(emoji => emoji=buttonvalue[i]);
      //}
      buttonText = buttonText.filter((name) => name != buttonText[i]);
      buttonEmoji = buttonEmoji.filter((value) => value != buttonEmoji[i]);
      //console.log(buttonname);
      chrome.storage.local.set({ name: buttonText }, function () {
        console.log("name is set to:", buttonText);
      });
      chrome.storage.local.set({ value: buttonEmoji }, function () {
        console.log("value is set to:", buttonEmoji);
      });
      chrome.storage.local.set({ emojis: changeableEmojis }, function () {
        console.log("value is set to:", changeableEmojis);
      });
      chrome.tabs.sendMessage(tabId, { removebutton: "remove" });

      window.close();
    };
  }
}
