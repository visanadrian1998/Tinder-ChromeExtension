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
    const messagetext = document.createElement("input");
    messagetext.type = "text";
    addMessageButton.insertAdjacentElement("beforebegin", messagetext);
  });
};
