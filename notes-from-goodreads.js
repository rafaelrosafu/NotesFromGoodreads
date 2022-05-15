var parsedNotes = {}
var currentURL = null

// Returns the current URL asynchronously
function getCurrentURL(){
    return browser.tabs.query({currentWindow: true, active: true})
      .then((tabs) => {
        currentURL = tabs[0].url;
    })
}

function processNotes(url) {
    let entries = parsedNotes[currentURL]
    let markdown = ""

    if (entries == undefined) {
        console.log(`No notes found for ${currentURL}`)
        return
    } else
    {
        console.log(`Found notes for ${currentURL}`)
        
        entries.forEach(entry => {
            // Highlight text
            markdown = markdown.concat("> ", entry.highlighted_text, "\n")
            // Note if it isn't empty
            if (entry.note_text != "") {
                markdown = markdown.concat("\t* ", entry.note_text, "\n")
            }
            // Add a line break before the next item to improve spacing
            markdown = markdown.concat("\n")
        });
    }

    navigator.clipboard.writeText(markdown).then(function() {
        console.log("Notes copied to clipboard")
        let notification = browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.extension.getURL("icons/n-icon-48.png"),
            "title": "Done!",
            "message": "The highlights and notes were copied to the clipboard."
            // ,"requireInteraction": false -> future feature perhaps. https://developer.mozilla.org/en-US/docs/Web/API/Notification/requireInteraction
        });
    }, function() {
        console.log("Failed to copy notes to clipboard")
        browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.extension.getURL("icons/n-icon-48.png"),
            "title": "Failed!",
            "message": "Failed to copy the highlights and notes to the clipboard."
          });        
    });
}

// Executed when the user clicks the extension button
function openPage() {
    getCurrentURL()
        .then(() => processNotes())
}

browser.browserAction.onClicked.addListener(openPage);

// Setup listener for message from the note parser
function receiveParsedNotes(message) {
    console.log(`--- Receiving ${message.parsedNotes.length} notes for ${message.url}`)
    parsedNotes[message.url] = message.parsedNotes
}

browser.runtime.onMessage.addListener(receiveParsedNotes);
