var parsedNotes = {}
var currentURL = null
var debugEnabled = false

let manifest = browser.runtime.getManifest();
// Ignores the * at the end of the target URL
var target_url = manifest.content_scripts[0].matches[0].substring(0,manifest.content_scripts[0].matches[0].length-1);
debug('Target URL: ' + target_url)

function debug(message) {
    if (debugEnabled) {
        console.log(message);
    }
}

// Returns the current URL asynchronously
function getCurrentURL() {
    return browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => {
            currentURL = tabs[0].url;
        })
}

function processNotes() {
    let entries = parsedNotes[currentURL]
    let markdown = ""

    if (entries == undefined) {
        debug(`No notes found for ${currentURL}`)
        return
    } else {
        debug(`Found notes for ${currentURL}`)

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

    navigator.clipboard.writeText(markdown).then(function () {
        debug("Notes copied to clipboard")
        let notification = browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.extension.getURL("icons/n-icon-48.png"),
            "title": "Done!",
            "message": "The highlights and notes were copied to the clipboard."
            // ,"requireInteraction": false -> future feature perhaps. https://developer.mozilla.org/en-US/docs/Web/API/Notification/requireInteraction
        });
    }, function () {
        debug("Failed to copy notes to clipboard")
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
    debug(`--- Receiving ${message.parsedNotes.length} notes for ${message.url}`)
    parsedNotes[message.url] = message.parsedNotes
}

browser.runtime.onMessage.addListener(receiveParsedNotes);

// Enables and disables button based on the active tab
async function enableDisableButton(tabId) {
    try {
        let tabInfo = await browser.tabs.get(tabId);
        if (tabInfo.url.startsWith(target_url)) {
            browser.browserAction.enable();
        } else {
            browser.browserAction.disable();
        }
    } catch (error) {
        console.error(error);
    }
}

function handleActivated(activeInfo) {
    enableDisableButton(activeInfo.tabId);
}
browser.tabs.onActivated.addListener(handleActivated);

function handleUpdated(tabId, changeInfo, tabInfo) {
    enableDisableButton(tabId);
}
browser.tabs.onUpdated.addListener(handleUpdated);