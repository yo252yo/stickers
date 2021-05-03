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


function populateinitDivDebugKeywords(){
  var debug_div = document.getElementById('yo252yo_extension_debug_keywords');
  if (!debug_div){
    return false;
  }

  var html = "";
  html += "<h1>Keyword map</h1>";
  html += "<table border=1>";
  html += "<tr><td style='padding:5px;'>KEYWORD</td><td style='padding:5px;'>TRIGGERS</td></tr>";
  var i = 0;
  for (key in LOG_TEXT_KEYS) {
    i++;
    html += print_logmap(key, "collapse");
  }
  if(i == 0){
    return false;
  }
  html += "</table>";

  html += "<h1>No stickers indexed</h1>";
  for (key in LOG_TEXT_KEYS) {
      if (key && !stickers_indexed[LOG_TEXT_KEYS[key][0]]){
          html += LOG_TEXT_KEYS[key][0];
          html += ",";
      }
  }

  debug_div.innerHTML = html;
  return true;
}


function populateinitDivDebugExpanded(){
  var debug_div = document.getElementById('yo252yo_extension_debug_expanded_stickers');
  if (!debug_div){
    return false;
  }

  var html = "";
  html += "<h1>Expanded map</h1>";
  html += "<table border=1>";
  html += "<tr><td style='padding:5px;'>KEYWORD</td><td style='padding:5px;'>TRIGGERS</td></tr>";
  var i = 0;
  for (key in LOG_TEXT_KEYS) {
    i ++;
    html += print_logmap(key, "visible");
  }
  if(i == 0){
    return false;
  }
  html += "</table>";
  debug_div.innerHTML = html;
  return true;
}

function populateinitDivDebugAll(){
  var debug_div = document.getElementById('yo252yo_extension_debug_all_stickers');
  if (!debug_div){
    return false;
  }

  var html = "";
  html += "<h1>All stickers</h1>";
  html += "<table border=1>";
  html += "<tr><td style='padding:5px;'>KEYWORD</td><td style='padding:5px;'>TRIGGERS</td></tr>";
  var i = 0;
  for (sticker in LOG_IMAGES) {
    i++;
    html += "<tr><td style='padding:5px;width:100px;'><img src='";
    html += sticker;
    html += "' width='100px' /></td><td style='padding:5px;width:50px;'>";
    html += Array.from(LOG_IMAGES[sticker]);
    html += "</td></tr>";
  }
  if(i == 0){
    return false;
  }
  html += "</table>";
  debug_div.innerHTML = html;
  return true;
}

var tryRender = function() {
  console.log("Try render");
  if (populateinitDivDebugKeywords() || populateinitDivDebugExpanded() || populateinitDivDebugAll()){
  console.log("Debug rendered");
    return;
  }
  setTimeout(tryRender, 3000);
}


var bgload = function () {
  tryRender();
};

var background_script = document.createElement('script');
background_script.onload = bgload;
background_script.src = "../background_loading.js";
document.head.appendChild(background_script);
