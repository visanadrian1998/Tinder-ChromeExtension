let tabId = null;
const stockEmojis = ["🤖", "👽", "🎃", "😈", "🥶", "🧙", "👣"];
let changeableEmojis = ["🤖", "👽", "🎃", "😈", "🥶", "🧙", "👣"];

chrome.runtime.onMessage.addListener((message) => {
  if (message.noMatches) {
    document.getElementById("noMatchesText").style.display = "inline";
  }
});

const runApp = (tab) => {
  //CHECK IF TINDER PAGE IS OPEN IN TAB
  if (tab.url.includes("tinder.com")) {
    tabId = tab.id;
    elementsCreationAndLogic();
    updatePopup();
  } else {
    //GET POPUP COMPONENTS
    const NavBar = document.getElementById("NavBar");
    const addAndRemoveButtons = document.getElementById("addAndRemoveButtons");
    const automaticMessageWrapper = document.getElementById(
      "automaticMessageWrapper"
    );
    const notOnTinder = document.getElementById("notOnTinder");

    //IF WE ARE NOT ON TINDER -> DISPLAY NOTONTINDER COMPONENT
    NavBar.style.display = "none";
    addAndRemoveButtons.style.display = "none";
    automaticMessageWrapper.style.display = "none";
    NavBarScroll.style.display = "none";
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
  noSetButton,
  justCreated
) => {
  //ADD TEXT INPUT TO CONTAINER
  container.appendChild(textInput);

  //ADD CONTAINER IN FRONT OF ADD&REMOVE BUTTONS
  addMessageButton.insertAdjacentElement("beforebegin", container);
  if (!noSetButton) {
    //INSERT SET BUTTON AFTER TEXT INPUT
    textInput.insertAdjacentElement("afterend", setButton);
    //INSERT EMOJI SELECTOR AFTER EMOJI SELECTOR
    setButton.insertAdjacentElement("afterend", emojiSelector);
    if (justCreated) {
      emojiSelector.style.left = "-31px";
    } else {
      emojiSelector.style.left = "-37px";
    }
  } else {
    //INSERT EMOJI SELECTOR AFTER TEXT INPUT
    textInput.insertAdjacentElement("afterend", emojiSelector);
  }
};

const messageTextLogic = (
  messageText,
  messageContainer,
  setMessageButton,
  editable,
  value
) => {
  // messageText.rows = 1;
  //WHEN WE CLICK ON A MESSAGE THE TEXTAREA EXPANDS AND ALSO WE CHANGE THE ALIGNMENT OF ITEMS
  messageText.id = "textInput";
  messageText.type = "textarea";
  messageText.placeholder = "Type a Message...";
  if (!editable) {
    messageText.readOnly = true;
    messageText.value = value;
  }
  // messageText.onclick = () => {
  //   if (messageText.readOnly) {
  //     messageText.rows = 5;
  //     messageContainer.style.alignItems = "flex-start";
  //   }
  // };
  //ON MOUSEOUT THE TEXTAREA RETURNS TO ONE ROW
  // messageText.onmouseout = () => {
  //   messageText.readOnly ? (messageText.rows = 1) : "";
  // };
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
  emojisArray,
  container,
  addMessageButton,
  rearangeButton
) => {
  const deleteFromPopup = document.createElement("input");
  deleteFromPopup.type = "button";
  deleteFromPopup.value = "×";
  deleteFromPopup.id = "deletefrompopup";
  elementToInsertAfter.insertAdjacentElement("afterend", deleteFromPopup);
  if (rearangeButton) {
    deleteFromPopup.style.left = "-35px";
  } else {
    deleteFromPopup.style.left = "7px";
  }
  //WHEN WE DELETE A MESSAGE:
  deleteFromPopup.onclick = async function () {
    //FIRST WE FETCH THE UPDATED ELEMENTS TO BE UP TO DATE
    messagesArray = await getSavedMessagesFromStorage();
    emojisArray = await getusedEmojisFromStorage();
    changeableEmojis = await getEmojisFromStorage();
    //ADD THE EMOJI BACK TO THE ARRAY OF AVAILABLE EMOJIS
    changeableEmojis.push(selectedEmoji);

    //WHEN WE DELETE A MESSAGE ADDMESSAGEBUTTON IS ENABLED BECAUSE WE HAVE AT LEAST ONE AVAILABLE EMOJI
    addMessageButton.disabled = false;

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

    //AFTER WE DELETE THE MESSAGE WE HIDE THE RESPECTIVE CONTAINER
    container.style.transform = "translateX(-600px)";
    container.addEventListener("transitionend", () => {
      setTimeout(() => {
        container.style.display = "none";
      }, 100);
    });
  };
};

const setMessageButtonLogic = (
  setMessageButton,
  addMessageButton,
  messageText,
  emojiSelector,
  messageContainer,
  justCreated
) => {
  //SETMESSAGEBUTTON IS DISABLED IF THE TEXT INPUT IS EMPTY
  if (setMessageButton.value === "Save") {
    setMessageButton.disabled = true;
  }
  setMessageButton.type = "button";
  setMessageButton.id = "setMessageButton";

  //ADDMESSAGEBUTTON IS DISABLED UNTIL WE SET THE CURRENT MESSAGE
  addMessageButton ? (addMessageButton.disabled = true) : null;
  setMessageButton.onclick = () => {
    if (setMessageButton.value === "Save") {
      //ENABLE THE ADD MESSAGE BUTTON WHEN WE SET THE CURRENT MESSAGE
      addMessageButton ? (addMessageButton.disabled = false) : null;
      if (justCreated) {
        emojiSelector.style.left = "0px";
      }
      emojiSelector.style.left = "-37px";
      const message = messageText.value;
      const emoji = emojiSelector.value || emojiSelector.innerHTML;
      const index = usedEmojis.indexOf(emoji);
      const messageToBeReplaced = savedMessages[index];
      if (messageText.name !== "edited") {
        savedMessages.push(message);
        usedEmojis.push(emoji);
      } else {
        savedMessages[index] = message;
        chrome.storage.local.set({ name: savedMessages }, function () {});
      }
      if (messageText.name !== "edited") {
        //REMOVE THE SELECTED EMOJI FROM THE ARRAY OF EMOJIS AND SET THE NEW ARRAY IN LOCAL STORAGE
        changeableEmojis = changeableEmojis.filter(
          (emoji) => emoji != emojiSelector.value
        );
        chrome.storage.local.set({ emojis: changeableEmojis }, function () {});

        //SEND THE MESSAGE AND THE EMOJI TO CONTENT
        chrome.tabs.sendMessage(tabId, {
          addmessage: message,
          addemoji: emoji,
        });
      } else {
        chrome.tabs.sendMessage(tabId, {
          editMessage: message,
          messageToBeReplaced: messageToBeReplaced,
        });
      }
      //TEXT INPUT DISABLED; EMOJI SELECTOR DISSAPEARS;SAVE BUTTON -> EDIT BUTTOn
      messageText.readOnly = true;
      setMessageButton.value = "Edit  ";
      if (justCreated) {
        setMessageButton.style.left = "-131px";
      }
      //emojiSelector.disabled = true;
      if (justCreated) {
        emojiSelector.style.display = "none";
      }
      if (messageText.name !== "edited") {
        //CREATE EMOJI CONTAINER
        emojiContainer = document.createElement("div");
        emojiContainer.classList.add("emojiContainer");
        emojiContainer.innerHTML = emoji;
        messageText.insertAdjacentElement("afterend", emojiContainer);

        createDeleteButton(
          emojiContainer,
          emoji,
          message,
          savedMessages,
          usedEmojis,
          messageContainer,
          addMessageButton,
          false
        );
      }
      //IF THERE ARE NO AVAILABLE EMOJIS THAT MEANS WE USED ALL OF THEM SO WE CAN'T ADD NO MORE MESSAGES.
      if (changeableEmojis.length == 0) {
        addMessageButton.disabled = true;
      }
    } else {
      if (setMessageButton.value === "Edit  ") {
        emojiSelector.style.left = "-37px";
        messageText.readOnly = false;
        setMessageButton.value = "Save";
        messageText.name = "edited";
      }
    }
  };
};
const automaticMessageLogic = (button, input) => {
  //BUTTON IS DISABLED IF THE TEXT INPUT IS EMPTY
  button.disabled = true;
  input.addEventListener("keyup", function () {
    input.value.length > 0
      ? (button.disabled = false)
      : (button.disabled = true);
  });
  input.addEventListener("keydown", () => {
    if (document.getElementById("noMatchesText").style.display == "inline") {
      document.getElementById("noMatchesText").style.display = "none";
    }
  });
  //SEND THE PREDEFINED MESSAGE TO CONTENT SCRIPT
  button.addEventListener("click", () => {
    const inputValue = input.value;
    chrome.tabs.sendMessage(tabId, { sendAutomatic: inputValue });
    input.value = "";
    button.disabled = true;
  });
};

const elementsCreationAndLogic = () => {
  //NAVBAR LOGIC

  const NavBarSaved = document.getElementById("savedMessages");
  const NavBarAutomatic = document.getElementById("automaticMessage");
  const NavBarScroll = document.getElementById("NavBarScroll");
  NavBarSaved.addEventListener("click", () => {
    addAndRemoveButtons.style.display = "inline";
    automaticMessageWrapper.style.display = "none";
    NavBarSaved.style.color = "white";
    NavBarAutomatic.style.color = "#FD5068";
    NavBarScroll.style.transform = "translateX(0px)";
    NavBarScroll.style.width = "126px";
  });
  NavBarAutomatic.addEventListener("click", () => {
    addAndRemoveButtons.style.display = "none";
    automaticMessageWrapper.style.display = "inline";
    NavBarSaved.style.color = "#FD5068";
    NavBarAutomatic.style.color = "white";
    NavBarScroll.style.transform = "translateX(119px)";
    NavBarScroll.style.width = "150px";
  });

  addMessageButton = document.getElementById("addMessage");
  removeAllMessagesButton = document.getElementById("removeAllButtons");
  automaticMessageButton = document.getElementById("automaticMessageButton");
  automaticMessageInput = document.getElementById("automaticMessageInput");
  automaticMessageLogic(automaticMessageButton, automaticMessageInput);
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
    setMessageButton.value = "Save";
    messageTextLogic(messageText, messageContainer, setMessageButton, true, "");
    emojiSelectorLogic(emojiSelector, true, "");

    fillContainerWithElements(
      messageContainer,
      messageText,
      addMessageButton,
      emojiSelector,
      setMessageButton,
      false,
      true
    );

    setMessageButtonLogic(
      setMessageButton,
      addMessageButton,
      messageText,
      emojiSelector,
      messageContainer,
      true
    );
  });
};

//GET ALL MESSAGES FROM STORAGE
function getSavedMessagesFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ name: [] }, function (result) {
        resolve(result.name);
      });
    }, 0);
  });
}

//GET THE USED EMOJIS FROM STORAGE
function getusedEmojisFromStorage() {
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
  savedMessages = await getSavedMessagesFromStorage();
  usedEmojis = await getusedEmojisFromStorage();
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
    //const emojiSelector = document.createElement("select");
    messageTextLogic(
      messageText,
      messageContainer,
      "",
      false,
      savedMessages[i]
    );
    const emojiContainer = document.createElement("div");
    emojiContainer.classList.add("emojiContainer");
    emojiContainer.innerHTML = usedEmojis[i];
    const editButton = document.createElement("input");
    editButton.type = "button";
    editButton.value = "Edit  ";
    editButton.id = "setMessageButton";

    setMessageButtonLogic(
      editButton,
      null,
      messageText,
      emojiContainer,
      messageContainer,
      false
    );

    fillContainerWithElements(
      messageContainer,
      messageText,
      addMessageButton,
      emojiContainer,
      editButton,
      false,
      false
    );

    createDeleteButton(
      emojiContainer,
      usedEmojis[i],
      savedMessages[i],
      savedMessages,
      usedEmojis,
      messageContainer,
      document.getElementById("addMessage"),
      true
    );
  }
}
