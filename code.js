/**
 * Copyright Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns the array of cards that should be rendered for the current
 * e-mail thread. The name of this function is specified in the
 * manifest 'onTriggerFunction' field, indicating that this function
 * runs every time the add-on is started.
 *
 * @param {Object} e The data provided by the Gmail UI.
 * @return {Card[]}
 */
function buildAddOn(e) {
  // Activate temporary Gmail add-on scopes.
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  // Get the email sender
  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);
  var sender = message.getFrom().replace(/^.+<([^>]+)>$/, "$1")

  // Create a section for that contains all user Labels.
  var section = CardService.newCardSection()
    .setHeader("<font color=\"#1257e0\"><b>Sender Info</b></font>")


  //
  var response = getEmailData(sender)
  var data = response.data
  
  var score = CardService.newDecoratedText().setTopLabel('Score').setText(data.score + '%')
  var smtp_server = CardService.newDecoratedText().setTopLabel('Server Status').setText(data.smtp_server)
  var mx_records = CardService.newDecoratedText().setTopLabel('MX Records').setText(data.mx_records)
  var webmail = CardService.newDecoratedText().setTopLabel('Webmail').setText(data.webmail)
    
  // Add the checkbox group to the section.
  section.addWidget(score);
  section.addWidget(smtp_server);
  section.addWidget(mx_records);
  section.addWidget(webmail);

  // Build the main card after adding the section.
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
    .setTitle(sender)
    .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/label_googblue_48dp.png'))
    .addSection(section)
    .build();

  
  return [card];
}

function getEmailData(sender) {
  const API_KEY = PropertiesService.getScriptProperties().getProperty(API_KEY);
  const url = "https://api.hunter.io/v2/email-verifier?email="+sender+"&api_key="+API_KEY
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  const data = JSON.parse(response.getContentText());
  return data
}

