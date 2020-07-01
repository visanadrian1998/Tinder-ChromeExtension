const conversation_state = {
  isInConversation: false,
};

/*let jokereceived;
let complimentreceived;
let datereceived;*/
let messagereceived;
let emojireceived;
let url;
let addedbuttons = [];
let buttonname = [];
let buttonvalue = [];
console.log(addedbuttons);
chrome.runtime.onMessage.addListener((message) => {
  console.log(message);

  /*if (message.joke){
      jokereceived=message.joke;
      console.log("joke received:",jokereceived);
  }
  
  if (message.compliment){
      complimentreceived=message.compliment;
      console.log("compliment received:",complimentreceived);
  }
  
  if (message.date){
      datereceived=message.date;
      console.log("date received:",datereceived);
  }*/

  if (message.addmessage) {
    console.log(addedbuttons);
    messagereceived = message.addmessage;
    emojireceived = message.addemoji;
    console.log("message received:", messagereceived);
    var messagebtn = document.createElement("input");
    messagebtn.type = "button";
    messagebtn.name = messagereceived;
    messagebtn.value = emojireceived;
    messagebtn.classList.add("buton");

    buttonname.push(messagereceived);
    buttonvalue.push(emojireceived);
    addedbuttons.push(messagebtn);
    console.log(addedbuttons);
    try {
      chrome.storage.local.set({ name: buttonname }, function () {
        console.log("name is set to:", buttonname);
      });
      chrome.storage.local.set({ value: buttonvalue }, function () {
        console.log("value is set to:", buttonvalue);
      });
    } catch (e) {
      console.log(e);
    }
    insertAddedMessages();
  }

  if (message.remove) {
    removeMessages();
    exitConversation();
  }
  if (message.removebutton) {
    addedbuttons.length = 0;
    updateButtons();
    exitConversation();
  }
});

const runApp = () => {
  window.addEventListener("click", function () {
    console.log(conversation_state.isInConversation);
    if (
      !window.location.href.includes("messages") ||
      url != window.location.href
    ) {
      conversation_state.isInConversation = false;
      for (let i = 0; i < addedbuttons.length; i++) {
        addedbuttons[i].disabled = false;
      }
    }

    if (
      window.location.href.includes("messages") &&
      !conversation_state.isInConversation
    ) {
      conversation_state.isInConversation = true;
      url = window.location.href;
      try {
        this.setTimeout(function () {
          //insertJoke();
          //insertCompliment();
          //insertDate();
          insertAddedMessages();
        }, 500);
      } catch (e) {
        this.console.log(e);
      }
    }
  });
};
updateButtons();
runApp();

/*function insertJoke(){

  const chatbox=document.getElementsByClassName('Flx($flx2) Pos(r) Ovy(s) W(100%) Ovx(h) Py(10px) Px(8px) Px(16px)--m Px(20px)--l')[0];
          console.log(chatbox);
          var jokebtn = document.createElement("input");
          jokebtn.type = "button";
          jokebtn.value="JOKE";
          jokebtn.classList.add("buton");
          chatbox.insertAdjacentElement('afterend',jokebtn);
          jokebtn.addEventListener('click',sendJoke);
}

function insertCompliment(){

  const chatbox=document.getElementsByClassName('Flx($flx2) Pos(r) Ovy(s) W(100%) Ovx(h) Py(10px) Px(8px) Px(16px)--m Px(20px)--l')[0];
  console.log(chatbox);
  var complimentbtn = document.createElement("input");
  complimentbtn.type = "button";
  complimentbtn.value="COMPLIMENT";
  complimentbtn.classList.add("buton");
  chatbox.insertAdjacentElement('afterend',complimentbtn);
  complimentbtn.addEventListener('click',sendCompliment);

}

function insertDate(){
  const chatbox=document.getElementsByClassName('Flx($flx2) Pos(r) Ovy(s) W(100%) Ovx(h) Py(10px) Px(8px) Px(16px)--m Px(20px)--l')[0];
  console.log(chatbox);
  var datebtn = document.createElement("input");
  datebtn.type = "button";
  datebtn.value="DATE";
  datebtn.classList.add("buton");
  chatbox.insertAdjacentElement('afterend',datebtn);
  datebtn.addEventListener('click',sendDate);
}*/

function insertAddedMessages() {
  //if(messagereceived){
  for (let i = 0; i < addedbuttons.length; i++) {
    try {
      const chatbox = document.getElementsByClassName(
        "D(f) W(100%) BdT Bdtc($c-divider) Bgc(#fff) Pos(r)"
      )[0];
      console.log(chatbox);
      chatbox.insertAdjacentElement("afterbegin", addedbuttons[i]);

      addedbuttons[i].style.left = `${35 * i}px`;

      addedbuttons[i].onclick = function () {
        window.InputEvent = window.Event || window.InputEvent;

        var event = new InputEvent("input", {
          bubbles: true,
        });

        const textarea = document.getElementById("chat-text-area");
        textarea.value = addedbuttons[i].name || "mesaj predefinit";
        textarea.dispatchEvent(event);
        console.log("message sent", event);
        const submit = document.getElementsByClassName(
          "button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($primary-gradient) button--primary-shadow StyledButton Fw($semibold) focus-button-style Mb(16px) As(fe)"
        )[0];
        submit.click();
        addedbuttons[i].disabled = true;
      };
    } catch (e) {
      console.log(e);
    }
  }
  //}
}

/*function sendJoke (message) {
  
  window.InputEvent = window.Event || window.InputEvent;
  var event = new InputEvent('input', {
    bubbles: true
  });
  console.log(event);
  let textarea=document.getElementById("chat-text-area");
  textarea.value =jokereceived || 'gluma predefinita';
  textarea.dispatchEvent(event);
  console.log("message sent",event);
  const submit=document.getElementsByClassName("button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($primary-gradient) button--primary-shadow StyledButton Fw($semibold) focus-button-style Mb(16px) As(fe)")[0];
  submit.click();

}

function sendCompliment (message) {
  
  window.InputEvent = window.Event || window.InputEvent;

  var event = new InputEvent('input', {
    bubbles: true
  });

  const textarea=document.getElementById("chat-text-area");
  textarea.value =complimentreceived || 'compliment predefinit';
  textarea.dispatchEvent(event);
  console.log("message sent",event);
  const submit=document.getElementsByClassName("button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($primary-gradient) button--primary-shadow StyledButton Fw($semibold) focus-button-style Mb(16px) As(fe)")[0];
  submit.click();
}

function sendDate (message) {
  
  window.InputEvent = window.Event || window.InputEvent;

  var event = new InputEvent('input', {
    bubbles: true
  });

  const textarea=document.getElementById("chat-text-area");
  textarea.value =datereceived || 'date predefinit';
  textarea.dispatchEvent(event);
  console.log("message sent",event);
  const submit=document.getElementsByClassName("button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($primary-gradient) button--primary-shadow StyledButton Fw($semibold) focus-button-style Mb(16px) As(fe)")[0];
  submit.click();
}*/

function sendMessage(message) {
  window.InputEvent = window.Event || window.InputEvent;

  var event = new InputEvent("input", {
    bubbles: true,
  });

  const textarea = document.getElementById("chat-text-area");
  textarea.value = messagebtn.name || "mesaj predefinit";
  textarea.dispatchEvent(event);
  console.log("message sent", event);
  const submit = document.getElementsByClassName(
    "button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($primary-gradient) button--primary-shadow StyledButton Fw($semibold) focus-button-style Mb(16px) As(fe)"
  )[0];
  submit.click();
}

function removeMessages() {
  addedbuttons.length = 0;
  buttonname.length = 0;
  buttonvalue.length = 0;
  chrome.storage.local.set({ name: buttonname });
  chrome.storage.local.set({ value: buttonvalue });
  console.log(addedbuttons);
}

function getButtonsNamesFromStorage() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      chrome.storage.local.get({ name: [] }, function (result) {
        console.log(result.name);
        resolve(result.name);
        //console.log(buttonname);
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
        //console.log(buttonname);
      });
    }, 0);
  });
}

async function updateButtons() {
  buttonname = await getButtonsNamesFromStorage();
  buttonvalue = await getButtonsValuesFromStorage();
  for (let i = 0; i < buttonname.length; i++) {
    var messagebtn = document.createElement("input");
    messagebtn.type = "button";
    messagebtn.name = buttonname[i];
    messagebtn.value = buttonvalue[i];
    messagebtn.classList.add("buton");
    addedbuttons.push(messagebtn);
  }
  console.log(addedbuttons);
}

function exitConversation() {
  try {
    const exit = document.getElementsByClassName(
      "C($c-divider) Bdc($c-divider) Bdc($c-gray):h C($c-gray):h Bdrs(50%) Bds(s) Bdw(3px) Trsdu($fast) Trsp($transform) Rotate(-90deg):h--ml close P(0) Lh(1) Cur(p) focus-button-style"
    )[0];
    exit.click();
  } catch (e) {
    console.log(e);
  }
}
