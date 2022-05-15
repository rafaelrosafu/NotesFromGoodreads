const entry_container     = ".noteHighlightTextContainer"
const highlight_container = ".noteHighlightTextContainer__highlightText > span"
const note_container      = ".noteContainer__noteText"

let parsedNotes = []

// Get entry containers 
entries = Array.from(document.querySelectorAll(entry_container))
// Loop through them
entries.forEach(entry => {
    // Get the highlighted text
    let highlighted_text = entry.querySelector(highlight_container).innerText
    // Get the note text, if any
    let note_text = entry.querySelector(note_container).innerText

    // Store as an object inside the parsedNotes array
    parsedNotes.push({
        'highlighted_text': highlighted_text,
        'note_text': note_text
    })
})

browser.runtime.sendMessage({
    "url": document.URL,
    "parsedNotes": parsedNotes
});