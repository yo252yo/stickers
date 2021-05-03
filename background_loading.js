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
// HACK: keywords --------------------------------------------------------------
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
// HACK: admin -----------------------------------------------------------------
// -----------------------------------------------------------------------------

function print_dependencies(key){
    html = "";
	if (LOG_TEXT_REFERENCES[key] && LOG_TEXT_REFERENCES[key].length > 0) {
		html += "<table border=1 style='width:100%;'>";
		for (i in LOG_TEXT_REFERENCES[key]){
			word = LOG_TEXT_REFERENCES[key][i];
			html += "<tr><td style='padding:5px;width:10%;'>";
			html += word;
			html += "</td><td style='padding:5px; width:90%'>";
			html += LOG_TEXT_KEYS[word];
			html += print_dependencies(word);
			html += "</td></tr>";
		}
		html += "</table>";
	}
    return html;
}

function print_logmap(key, visibility){
	if (!LOG_TEXT_KEYS[key]){
		console.log("MISSING LOG_TEXT_KEYS FOR " + key);
        return "";
	}
	if (!stickers_indexed[LOG_TEXT_KEYS[key][0]]){
		console.log("MISSING stickers_indexed FOR " + LOG_TEXT_KEYS[key][0]);
        return "";
	}
	var stickers = stickers_indexed[LOG_TEXT_KEYS[key][0]];

    html = "";
	html += "<tr><td style='padding:5px;width:100px;'>";
	html += key + " (" + stickers.size + ")";
	html += "</td><td style='padding:5px;width:50px;'>";
	html += LOG_TEXT_KEYS[key];

	html += print_dependencies(key);

	html += "</td></tr>";
	html += "<tr id='" + key + "' style='visibility:" + visibility + ";'><td colspan='2'><div>";
	for (let sticker_url of stickers){
		html += "<img src='" + sticker_url + "' width='100px' />";
	}
	html += "</div></td></tr>";
    return html;
}


function populateAdminKeywords(){
    var admin_div = document.getElementById('yo252yo_extension_admin_keywords');
    if (admin_div){
        var html = "";
        html += "<h1>Keyword map</h1>";
        html += "<table border=1>";
        html += "<tr><td style='padding:5px;'>KEYWORD</td><td style='padding:5px;'>TRIGGERS</td></tr>";
        for (key in LOG_TEXT_KEYS) {
            html += print_logmap(key, "collapse");
        }
        html += "</table>";

        html += "<h1>No stickers indexed</h1>";
        for (key in LOG_TEXT_KEYS) {
            if (key && !stickers_indexed[LOG_TEXT_KEYS[key][0]]){
                html += LOG_TEXT_KEYS[key][0];
                html += ",";
            }
        }

        admin_div.innerHTML = html;
        console.log(">> admin console loaded");
    }
}


function populateAdminExpanded(){
    var admin_div = document.getElementById('yo252yo_extension_admin_expanded_stickers');
    if (admin_div){
        var html = "";
        html += "<h1>Expanded map</h1>";
        html += "<table border=1>";
        html += "<tr><td style='padding:5px;'>KEYWORD</td><td style='padding:5px;'>TRIGGERS</td></tr>";
        for (key in LOG_TEXT_KEYS) {
            html += print_logmap(key, "visible");
        }
        html += "</table>";
        admin_div.innerHTML = html;
        console.log(">> admin console loaded");
    }
}

function populateAdminAll(){
    var admin_div = document.getElementById('yo252yo_extension_admin_all_stickers');
    if (admin_div){
        var html = "";
        html += "<h1>All stickers</h1>";
        html += "<table border=1>";
        html += "<tr><td style='padding:5px;'>KEYWORD</td><td style='padding:5px;'>TRIGGERS</td></tr>";
        for (sticker in LOG_IMAGES) {
            html += "<tr><td style='padding:5px;width:100px;'><img src='";
            html += sticker;
            html += "' width='100px' /></td><td style='padding:5px;width:50px;'>";
            html += Array.from(LOG_IMAGES[sticker]);
            html += "</td></tr>";
        }
        html += "</table>";
        admin_div.innerHTML = html;
        console.log(">> admin console loaded");
    }
}

window.addEventListener("load", function(){
	setTimeout(function(){
		populateAdminKeywords();
		populateAdminExpanded();
		populateAdminAll();
	}, 3000);
}, false);


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
