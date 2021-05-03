window["stop"] = null;

LOG_TEXT_KEYS = {};
LOG_TEXT_REFERENCES = {};
LOG_IMAGES = {};

MAX_STICKERS_AT_ONCE = 80;

stickers_indexed = {};

function c_core() {
  var array = [];
  for (var i = 0; i < arguments.length; i++) {
    if (!arguments[i] || arguments[i] == ""){
        continue;
    }
	if(window[arguments[i]] && LOG_TEXT_REFERENCES[arguments[i]]) {
		array = array.concat(window[arguments[i]]);
	}
	else if (typeof arguments[i] === 'string' || arguments[i] instanceof String ) {
		array.push(arguments[i]);
	}
	else {
		for (var j = 0; j < arguments[i].length; j++) {
			var development = c_core(arguments[i][j]);
			array = array.concat(development);
		}
	}
  }
  return array;
}

function c() {
  return c_core(arguments);
}

function attach(name, values){
    if (name == null || name == "") {
        return;
    }

	values = [name].concat(values);

	if (! LOG_TEXT_REFERENCES[name]){
		LOG_TEXT_REFERENCES[name] = [];
	}

	for (var i = 0; i < values.length; i++) {
		var value = values[i];
        if (value && value != "") {
            if (window[value]) {
                LOG_TEXT_REFERENCES[name].push(value);
            }
        }
	}

	window[name] = c(values);
	LOG_TEXT_KEYS[name] = window[name];
}

function preloadAndCheck(url, data) {
	image = new Image();
	image.src = url;
	image.id = url;
	image.onerror = function() {
		console.error('!!!!!!!!!! Invalid image: ' + url + ' - ' + data);
	};

  return url;
}


// -----------------------------------------------------------------------------
// HACK: stickers loading ------------------------------------------------------
// -----------------------------------------------------------------------------

function randomizeStickers() {
	for (keyword in stickers_indexed) {
		var list = [];
		for (let sticker_url of stickers_indexed[keyword]){
			var pos = Math.floor(Math.random() * (stickers_indexed[keyword].length));
			while (list[pos]){
				pos = Math.floor(Math.random() * (stickers_indexed[keyword].length));
			}
			list[pos] = sticker_url;
		}

		stickers_indexed[keyword] = [];

		for (var i = 0; i < Math.min(MAX_STICKERS_AT_ONCE, list.length); i++) {
			stickers_indexed[keyword].push(list[i]);
		}
	}

	console.log(">> STICKER DICTIONARY RANDOMIZED");
}

function populateStickersFromFile(stickers_file) {
	var lines = stickers_file.split('\n');
	for(var l_i = 1; l_i < lines.length; l_i++){
		var line = lines[l_i].split(',');
		var url = line[0];
		var rest = line.slice(1, line.length);

		for (i = 0; i < rest.length; i++){
			keywords = c(rest[i]);
			for (j = 0; j < keywords.length; j++){
				keyword = keywords[j].replace(/(\r\n|\n|\r|\t)/gm, "");
				if (!keyword || keyword == "" || keyword == " " || keyword === "" || keyword === null){
					continue;
				}
				if (!stickers_indexed[keyword]){
					stickers_indexed[keyword] = [];
				}
				stickers_indexed[keyword].push(preloadAndCheck(url, keyword));

				if(! LOG_IMAGES[url]){
					LOG_IMAGES[url] = new Set();
				}
				LOG_IMAGES[url].add(keyword);
			}
		}

	}
	console.log(">> STICKER DICTIONARY LOADED");
	randomizeStickers();
}

function loadStickersIndex() {
	// CSV FORMAT (with headers): URL, word, word, word...
  stickers_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-NUWXuTyIx9ds4ZXOue5LJ7u7HRyoBNfCPEMFMuF7hk7AdUzGz6JSqgUYYbORnrv78zBLOULufBfX/pub?gid=1525517825&single=true&output=csv";
  stickers_file = new XMLHttpRequest();
	stickers_file.onreadystatechange = function() {
		if (stickers_file.readyState == XMLHttpRequest.DONE) {
			if(stickers_file.status === 200 || stickers_file.status == 0)
			{
				populateStickersFromFile(stickers_file.responseText);
			}
		}
	};
  stickers_file.open("GET", stickers_url, true);
  stickers_file.setRequestHeader('Access-Control-Allow-Headers', '*');
  stickers_file.setRequestHeader('Content-type', 'text/csv');
  stickers_file.setRequestHeader('Access-Control-Allow-Origin', '*');
  stickers_file.send(null);
}


// -----------------------------------------------------------------------------
// HACK: keywords loading ------------------------------------------------------
// -----------------------------------------------------------------------------

function populateKeywordsFromFile(keywords_file) {
	var lines = keywords_file.split('\n');
	for(var l_i = 1; l_i < lines.length; l_i++){
		var line = lines[l_i].split(',');
		attach(line[0], line.slice(1, line.length));
	}
	console.log(">> KEYWORD DICTIONARY LOADED");
	loadStickersIndex();
}

function loadKeywords() {
	// CSV FORMAT (with headers): KEY, word, word, word...
	keywords_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-NUWXuTyIx9ds4ZXOue5LJ7u7HRyoBNfCPEMFMuF7hk7AdUzGz6JSqgUYYbORnrv78zBLOULufBfX/pub?gid=312853833&single=true&output=csv";
	keywords_file = new XMLHttpRequest();
	keywords_file.onreadystatechange = function() {
		if (keywords_file.readyState == XMLHttpRequest.DONE) {
			if(keywords_file.status === 200 || keywords_file.status == 0) {
				populateKeywordsFromFile(keywords_file.responseText);
			}
		}
	}
	keywords_file.open("GET", keywords_url, true);
	keywords_file.setRequestHeader('Access-Control-Allow-Headers', '*');
	keywords_file.setRequestHeader('Content-type', 'text/csv');
	keywords_file.setRequestHeader('Access-Control-Allow-Origin', '*');
	keywords_file.send(null);
}

loadKeywords();


// -----------------------------------------------------------------------------
// HACK: Listeners -------------------------------------------------------------
// -----------------------------------------------------------------------------

if(chrome.windows){
	console.log("create listener");
	chrome.windows.onCreated.addListener(function(window){
		console.log("preloading images");
		for (keyword in stickers_indexed) {
			for (var i = 0; i < stickers_indexed[keyword].length; i++) {
				preloadAndCheck(stickers_indexed[keyword][i], keyword);
			}
		}
	});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      sendResponse({0: stickers_indexed});
  }
);
