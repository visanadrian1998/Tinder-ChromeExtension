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
    addAndRemoveButtons = document.getElementById("messageList");
    notOnTinder = document.getElementById("not-tinder");
    messageList.style.display = "none";
    notOnTinder.style.display = "inline";
  }
};

window.addEventListener("DOMContentLoaded", () =>
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => tabs.length && runApp(tabs[0])
  )
);

if (notOnTinder) {
  notOnTinder.onClick = () => {
    chrome.tabs.create({ url: "https://tinder.com", active: true });
  };
}
