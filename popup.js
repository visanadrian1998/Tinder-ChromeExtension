let tabId = null;
const stockEmojis = ["✪", "⚔️", "☎", "♛", "♫", "☯", "❤️"];
let changeableEmojis = ["✪", "⚔️", "☎", "♛", "♫", "☯", "❤️"];

const runApp = (tab) => {
  //CHECK IF TINDER PAGE IS OPEN IN TAB
  if (tab.url.includes("tinder.com")) {
    const tabId = tab.id;
    selectElements();
    //updatePopup();
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
    chrome.storage.local.set({ emojis: predefinedemojis }, function () {});
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
      const messageSelected = messageText.value;
      const emojiSelected = emojiSelector.value;
      buttonText.push(messageSelected);
      buttonEmoji.push(emojiSelected);
      changeableEmojis = changeableEmojis.filter(
        (emoji) => emoji != emojiSelector.value
      );
      chrome.storage.local.set({ emojis: changeableEmojis }, function () {});
      chrome.tabs.sendMessage(tabId, {
        addmessage: messageSelected,
        addemoji: emojiSelected,
      });
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

function getButtonsNamesFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ name: [] }, function (result) {
        console.log(result.name);
        resolve(result.name);
        console.log(buttonname);
      });
    }, 0);
  });
}

function getButtonsValuesFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ value: [] }, function (result) {
        console.log(result.value);
        resolve(result.value);
        console.log(buttonname);
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
  buttonname = await getButtonsNamesFromStorage();
  buttonvalue = await getButtonsValuesFromStorage();
  emojis = await getEmojisFromStorage();

  if (buttonname.length == predefinedemojis.length) {
    document.getElementById("add").disabled = true;
  }

  if (emojis.length == 0 && buttonname.length == 0) {
    emojis = predefinedemojis;
  } /*else{
      if(emojis.length==0){
        emojis=predefinedemojis.filter(emoji => !buttonvalue.includes(emoji));
      }
    }*/

  for (let i = 0; i < buttonname.length; i++) {
    var messagetext = document.createElement("input");
    messagetext.type = "text";
    messagetext.value = buttonname[i];
    messagetext.readOnly = true;
    messagetext.id = "storagetext";
    addbtn.insertAdjacentElement("beforebegin", messagetext);

    var emojiselector = document.createElement("input");
    emojiselector.type = "button";
    emojiselector.value = buttonvalue[i];
    emojiselector.id = "emoji";
    messagetext.insertAdjacentElement("afterend", emojiselector);

    var deletefrompopup = document.createElement("input");
    deletefrompopup.type = "button";
    deletefrompopup.value = "×";
    deletefrompopup.id = "deletefrompopup";
    emojiselector.insertAdjacentElement("afterend", deletefrompopup);

    deletefrompopup.onclick = function () {
      console.log(buttonname);
      //if(emojis.length>=predefinedemojis.length){
      emojis.push(buttonvalue[i]);
      //emojis=emojis.filter(emoji => emoji=buttonvalue[i]);
      //}
      buttonname = buttonname.filter((name) => name != buttonname[i]);
      buttonvalue = buttonvalue.filter((value) => value != buttonvalue[i]);
      console.log(buttonname);
      chrome.storage.local.set({ name: buttonname }, function () {
        console.log("name is set to:", buttonname);
      });
      chrome.storage.local.set({ value: buttonvalue }, function () {
        console.log("value is set to:", buttonvalue);
      });
      chrome.storage.local.set({ emojis: emojis }, function () {
        console.log("value is set to:", emojis);
      });
      chrome.tabs.sendMessage(tabId, { removebutton: "remove" });

      window.close();
    };
  }
}
