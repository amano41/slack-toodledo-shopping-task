function doPost(e) {

  var properties = PropertiesService.getScriptProperties().getProperties();
  var token = properties.VERIFICATION_TOKEN;

  if (token != e.parameter.token) {
    throw new Error("Invalid Token");
  }

  // Bot の投稿には反応しない
  var user = e.parameter.user_name;
  if (user == "slackbot") { // インテグレーションの設定によらず
    return;                 // Bot のユーザー名はつねに Slackbot になるらしい
  }

  var text = e.parameter.text;

  // Toodledo にタスクを追加
  sendRequest(text, "Shopping");

  // レスポンスの内容を作成
  var message = createMessage(text);
  var attachments = [];
  var content = createContent(message, attachments);

  // Outgoing Webhook で呼ばれた場合
  // レスポンスを返しても表示されないので手動で投稿する
  var command = e.parameter.command;
  if (typeof command == "undefined") {
    postResponse("shopping", content);
  }

  return createResponse(content, true);
}


function sendRequest(task, folder, context, duedate, note) {

  var properties = PropertiesService.getScriptProperties().getProperties();
  var recipient = properties.TOODLEDO_EMAIL_ADDRESS;

  var subject = task;
  var body = note;

  if (typeof folder != "undefined") {
    subject += (" *" + folder);
  }

  if (typeof context != "undefined") {
    subject += (" @" + context);
  }

  if (typeof duedate != "undefined") {
    subject += (" #" + duedate);
  }

  MailApp.sendEmail(recipient, subject, body);
}


function createMessage(user, task) {
  return "@" + user + ": Your request has been sent successfully.";
}


function createContent(text, attachments) {
  return {
    "username" : "買い物リスト",
    "icon_emoji" : ":purse:",
    "text" : text,
    "attachments" : attachments
  };
}


function createResponse(content, in_channel) {

  var response = {
    "username" : content.username,
    "icon_emoji" : content.icon_emoji,
    "text" : content.text,
    "attachments" : content.attachments
  };

  if (in_channel) {
    response.response_type = "in_channel";
  }

  var json = JSON.stringify(response);
  var mime = ContentService.MimeType.JSON;

  return ContentService.createTextOutput(json).setMimeType(mime);
}


function postResponse(channel, content) {

  var username = content.username;
  var icon_emoji = content.icon_emoji;
  var text = content.text;
  var attachments = content.attachments;

  postSlackMessage(channel, username, icon_emoji, text, attachments);
}


function postDebugTrace(text) {
  postSlackMessage("debug", "shopping-task", ":memo:", text, "")
}


function testDoPost() {

  var properties = PropertiesService.getScriptProperties().getProperties();
  var token = properties.VERIFICATION_TOKEN;

  var e = {
    parameter : {
      "token" : token,
      "channel_name" : "shopping",
      "user_name" : "test",
      "command" : "/buy",
      "text" : "something to buy",
    }
  };
  Logger.log(e);

  var response = doPost(e);
  Logger.log(response);
}
