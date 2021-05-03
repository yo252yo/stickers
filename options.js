
function save_options() {
  var stickersCSV = document.getElementById('stickers_csv').value;
  var keywordsCSV = document.getElementById('keywords_csv').value;
  chrome.storage.sync.set({
    stickersCSV: stickersCSV,
    keywordsCSV: keywordsCSV
  }, function(){
    console.log("options saved");
  });
}

function restore_options() {
  document.getElementById('stickers_csv').value = KEYWORDS_CSV;
  document.getElementById('keywords_csv').value = STICKERS_CSV;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
