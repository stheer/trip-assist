//////////Written by Scott Theer//////////

//Ajax Post Method with callback
export function ajaxPost(url, cat, callback, callbackError){
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) { 
        if (xmlhttp.status == 200) {
          callback(xmlhttp.responseText);
          }
        else {
          callbackError();
        }
    }
  };
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.send(JSON.stringify({
    value: cat
  }));
}

//Ajax Post standard error callback function
export function catchAjaxError(data){
  console.log("Error: " + data);
}

//Makes first letter of each word uppercase, rest lowercase
export function properCasing(string){
  var separated = string.toLowerCase().split(' ');
   for (var i = 0; i < separated.length; i++) {
      separated[i] = separated[i].charAt(0).toUpperCase() +
      separated[i].substring(1);
   }
   return separated.join(' ');
}

//Creates hidden post form to send parameters in redirecting post request
export function postAndRedirect(url, postData) {
  var hiddenForm = document.createElement("form");
  hiddenForm.setAttribute('id','hidden-post');
  hiddenForm.setAttribute('action', url);
  for (var key in postData){
    if (postData.hasOwnProperty(key)){
      var i = document.createElement("input");
      i.setAttribute('type','hidden');
      i.setAttribute('name',key);
      i.setAttribute('value', postData[key]);
      hiddenForm.appendChild(i);
    }
  }
  document.getElementsByTagName("BODY")[0].append(hiddenForm);
  document.getElementById('hidden-post').submit();
}