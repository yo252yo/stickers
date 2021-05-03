stickerDivId = 'stickerDiv';

currentTable = [];
currentWord = "";
lastPressed = null;
stickers_indexed = {};

function initDiv(){
	var div = document.createElement('div');
	div.id = stickerDivId;
	div.className = stickerDivId;

	div.style.backgroundColor= "rgba(0, 125, 155, 0.7)";
  div.style.position= "fixed";
  div.style.zIndex="500";
  div.style.top="10%";
  div.style.bottom="10%";
  div.style.left="10%";
  div.style.right="10%";
	div.style.visibility="hidden";
	div.style.overflow="scroll";

	document.getElementsByTagName('body')[0].appendChild(div);
}

function displayDiv(){
	if (!document.getElementById(stickerDivId)){
		initDiv();
	}
	document.getElementById(stickerDivId).style.visibility="visible";
}

function hideDiv(){
	if (document.getElementById(stickerDivId)){
		document.getElementById(stickerDivId).style.visibility="hidden";
	}
	currentTable = [];
}

function htmlOfImg(url) {
	string = '<div  id="' + url + '"><img src="' + url + '" style="width:150px;height:150px;margin:20px;float:left;" class="stickerImages" /></div>';
	return string;
}

function populateDiv(set){
	document.getElementById(stickerDivId).innerHTML = "";
	currentTable = [];

	for (var i = 0; i < set.length; i++) {
		sticker_url = set[i];
		document.getElementById(stickerDivId).innerHTML += htmlOfImg(sticker_url);
		currentTable.push(sticker_url);
	}
	setTimeout(function(){
		$('.stickerImages').click(function () {
			writeUrl(this.src);
		});
	}, 1000);
}

function copyTextToClipboard(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

function writeUrl(url){
	copyTextToClipboard(url);
	lastPressed.focus();

	hideDiv();
}

function writeImageNumber(i){
	if (currentTable.length > i) {
		writeUrl(currentTable[i]);
	}
}

function insertImgFromKey(key){
	writeImageNumber(parseInt(key) - 1);
}

function checkWord(_word) {
  _word = _word.replace(/(\r\n|\n|\r|\t)/gm, "");
  if(!_word || !_word.length > 0 || _word === ""){
      return;
  }
  if (_word in stickers_indexed){
	  displayDiv();
	  populateDiv(stickers_indexed[_word]);
  } else {
	  hideDiv();
  }
}

function endword(){
  if (currentWord) {
    checkWord(currentWord.toLowerCase());
  }
  currentWord = "";
}

function makeWordOnKeyPress(event){
    var inputValue = event.which;
    var key = String.fromCharCode(inputValue);
    var interuptKeys = ["!","?"];

    if (key == " ") {
      endword();
    } else if (interuptKeys.indexOf(key) > -1 ) {
      currentWord = key;
      endword();
    } else {
      currentWord += key;
//      hideDiv();
    }
    lastPressed = event.target;
}

function controlDivByKeyDown(event){
    var inputValue = event.which;
    var key = String.fromCharCode(inputValue);
    var interuptKeys = [8,13,46];

    if (event.shiftKey && currentTable.length > 0 && key > 0 && key < 10){
		insertImgFromKey(key);
		//currentWord = "";
		hideDiv();
		return false;
	}
	if (!event.shiftKey && document.getElementById(stickerDivId) && document.getElementById(stickerDivId).style.visibility == "visible"){
		hideDiv();
	}
    if (interuptKeys.indexOf(event.which) > -1 || interuptKeys.indexOf(event.keyCode) > -1) {
      endword();
    }
}

$(document).keypress(makeWordOnKeyPress);
$(document).keydown(controlDivByKeyDown);

$(document).click(function(event){
    hideDiv();
});

chrome.runtime.sendMessage({},
  function(response) {
    stickers_indexed = response[0];
  });
