let tabId = null;
const stockEmojis = ["✪", "✂", "☎", "♛", "♫", "☯", "⚖"];
let changeableEmojis = ["✪", "✂", "☎", "♛", "♫", "☯", "⚖"];

const runApp = (tab) => {
  //CHECK IF TINDER PAGE IS OPEN IN TAB
  if (tab.url.includes("tinder.com")) {
    tabId = tab.id;
    elementsCreationAndLogic();
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

//WHEN CONTENT LOADED -> RUN EXTENSION
window.addEventListener("DOMContentLoaded", () =>
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => tabs.length && runApp(tabs[0])
  )
);

//ADD THE TEXT INPUT,EMOJI SELECTOR AND SET BUTTON TO CONTAINER
const fillContainerWithElements = (
  container,
  textInput,
  addMessageButton,
  emojiSelector,
  setButton,
  noSetButton
) => {
  //ADD TEXT INPUT TO CONTAINER
  container.appendChild(textInput);

  //ADD CONTAINER IN FRONT OF ADD&REMOVE BUTTONS
  addMessageButton.insertAdjacentElement("beforebegin", container);

  //INSERT EMOJI SELECTOR AFTER TEXT INPUT
  textInput.insertAdjacentElement("afterend", emojiSelector);

  if (!noSetButton) {
    //INSERT SET BUTTON AFTER EMOJI SELECTOR
    emojiSelector.insertAdjacentElement("afterend", setButton);
  }
};

const messageTextLogic = (
  messageText,
  messageContainer,
  setMessageButton,
  editable,
  value
) => {
  messageText.rows = 1;
  //WHEN WE CLICK ON A MESSAGE THE TEXTAREA EXPANDS AND ALSO WE CHANGE THE ALIGNMENT OF ITEMS
  messageText.id = "textInput";
  messageText.type = "text";
  if (!editable) {
    messageText.readOnly = true;
    messageText.value = value;
  }
  messageText.onclick = () => {
    if (messageText.readOnly) {
      messageText.rows = 5;
      messageContainer.style.alignItems = "flex-start";
    }
  };
  //ON MOUSEOUT THE TEXTAREA RETURNS TO ONE ROW
  messageText.onmouseout = () => {
    messageText.readOnly ? (messageText.rows = 1) : "";
  };
  //IF TEXT INPUT CONTAINS SOMETHING -> SET BUTTON ISN'T DISABLED;IF IT IS EMPTY->DISABLED BUTTON
  if (editable) {
    messageText.addEventListener("keyup", function () {
      messageText.value.length > 0
        ? (setMessageButton.disabled = false)
        : (setMessageButton.disabled = true);
    });
  }
};

//EMOJI SELECTOR:LOAD THE OPTIONS WITH OUR EMOJIS
const emojiSelectorLogic = (emojiSelector, editable, value) => {
  //CREATE EMOJI SELECTOR AND LOAD THE OPTIONS WITH OUR EMOJIS
  emojiSelector.id = "emojiSelector";
  if (editable) {
    for (i = 0; i < changeableEmojis.length; i++) {
      const option = document.createElement("option");
      option.innerHTML = changeableEmojis[i];
      emojiSelector.add(option);
    }
  } else {
    emojiSelector.disabled = true;
    const option = document.createElement("option");
    option.innerHTML = value;
    emojiSelector.add(option);
  }
};

const createDeleteButton = (
  elementToInsertAfter,
  selectedEmoji,
  selectedMessage,
  messagesArray,
  emojisArray
) => {
  const deleteFromPopup = document.createElement("input");
  deleteFromPopup.type = "button";
  deleteFromPopup.value = "×";
  deleteFromPopup.id = "deletefrompopup";
  elementToInsertAfter.insertAdjacentElement("afterend", deleteFromPopup);

  //WHEN WE DELETE A MESSAGE:
  deleteFromPopup.onclick = function () {
    //ADD THE EMOJI BACK TO THE ARRAY OF AVAILABLE EMOJIS
    changeableEmojis.push(selectedEmoji);

    //REMOVE THE MESSAGE FROM THE ARRAY OF MESSAGES
    messagesArray = messagesArray.filter((name) => name != selectedMessage);
    //REMOVE THE EMOJI FROM THE ARRAY OF USED EMOJIS
    emojisArray = emojisArray.filter((value) => value != selectedEmoji);
    //UPDATE THE LOCAL STORAGE
    chrome.storage.local.set({ name: messagesArray }, function () {});
    chrome.storage.local.set({ value: emojisArray }, function () {});
    chrome.storage.local.set({ emojis: changeableEmojis }, function () {});

    //SEND REMOVE MESSAGE TO CONTENT
    chrome.tabs.sendMessage(tabId, { removeButton: "remove" });

    window.close();
  };
};

const setMessageButtonLogic = (
  setMessageButton,
  addMessageButton,
  messageText,
  emojiSelector
) => {
  //SETMESSAGEBUTTON IS DISABLED IF THE TEXT INPUT IS EMPTY
  setMessageButton.disabled = true;
  setMessageButton.type = "button";
  setMessageButton.value = "SET!";
  setMessageButton.id = "setMessageButton";

  //ADDMESSAGEBUTTON IS DISABLED UNTIL WE SET THE CURRENT MESSAGE
  addMessageButton.disabled = true;

  setMessageButton.addEventListener("click", function () {
    //ENABLE THE ADD MESSAGE BUTTON WHEN WE SET THE CURRENT MESSAGE
    addMessageButton.disabled = false;

    const message = messageText.value;
    const emoji = emojiSelector.value;
    savedMessages.push(message);
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

    createDeleteButton(
      emojiSelector,
      emoji,
      message,
      savedMessages,
      buttonEmoji
    );

    //IF THERE ARE NO AVAILABLE EMOJIS THAT MEANS WE USED ALL OF THEM SO WE CAN'T ADD NO MORE MESSAGES.
    if (changeableEmojis.length == 0) {
      addMessageButton.disabled = true;
    }
  });
};

const elementsCreationAndLogic = () => {
  addMessageButton = document.getElementById("addMessage");
  removeAllMessagesButton = document.getElementById("removeAllButtons");

  //SEND MESSAGE TO CONTENT AND IN LOCAL STORAGE SET EMOJIS TO THE STOCK ONES
  removeAllMessagesButton.addEventListener("click", function () {
    chrome.tabs.sendMessage(tabId, { removeAllButtons: "remove" });
    chrome.storage.local.set({ emojis: stockEmojis }, function () {});
    window.close();
  });

  addMessageButton.addEventListener("click", function () {
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    //CREATE TEXT INPUT
    const messageText = document.createElement("textarea");
    //CREATE EMOJI SELECTOR
    const emojiSelector = document.createElement("select");
    //CREATE "SET" BUTTON
    const setMessageButton = document.createElement("input");

    messageTextLogic(messageText, messageContainer, setMessageButton, true, "");
    emojiSelectorLogic(emojiSelector, true, "");

    fillContainerWithElements(
      messageContainer,
      messageText,
      addMessageButton,
      emojiSelector,
      setMessageButton,
      false
    );

    setMessageButtonLogic(
      setMessageButton,
      addMessageButton,
      messageText,
      emojiSelector
    );
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

//GET THE REMAINING AVAILABLE EMOJIS FROM STORAGE
function getEmojisFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ emojis: [] }, function (result) {
        resolve(result.emojis);
      });
    }, 0);
  });
}

async function updatePopup() {
  //FETCH THE MESSAGES AND EMOJIS FROM STORAGE
  savedMessages = await getButtonTextFromStorage();
  buttonEmoji = await getButtonEmojiFromStorage();
  changeableEmojis = await getEmojisFromStorage();

  //IF THE NUMBER OF MESSAGES EQUALS THE NUMBER OF ALL EMOJIS -> WE HAVE USED ALL EMOJIS SO WE CAN'T ADD NEW MESSAGES
  if (savedMessages.length == stockEmojis.length) {
    document.getElementById("addMessage").disabled = true;
  }

  if (changeableEmojis.length == 0 && savedMessages.length == 0) {
    changeableEmojis = stockEmojis;
  }

  //FOR EVERY MESSAGE WE CREATE A CONTAINER WITH:THE MESSAGE, THE EMOJI AND A DELETE BUTTON
  for (let i = 0; i < savedMessages.length; i++) {
    //CREATE CONTAINER
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";

    const messageText = document.createElement("textarea");
    const emojiSelector = document.createElement("select");
    messageTextLogic(
      messageText,
      messageContainer,
      "",
      false,
      savedMessages[i]
    );
    emojiSelectorLogic(emojiSelector, false, buttonEmoji[i]);

    fillContainerWithElements(
      messageContainer,
      messageText,
      addMessageButton,
      emojiSelector,
      "",
      true
    );

    createDeleteButton(
      emojiSelector,
      buttonEmoji[i],
      savedMessages[i],
      savedMessages,
      buttonEmoji
    );
  }
}
