function postSlackMessage(channel, username, icon_emoji, message, attachments) {

  var properties = PropertiesService.getScriptProperties().getProperties();
  var webhook = properties.WEBHOOK_URL;

  var payload = {
    "channel" : channel,
    "username" : username,
    "icon_emoji" : icon_emoji,
    "text" : message,
    "attachments" : attachments
  };

  return postHttpRequest(webhook, payload);
}


function postHttpRequest(url, payload) {

  var options = {
    "method" : "POST",
    "payload" : JSON.stringify(payload)
  }

  var response = UrlFetchApp.fetch(url, options);

  return response.getContentText("UTF-8");
}
