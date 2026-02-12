# MyVoc: Personal Vocabulary & PWA

**MyVoc** is a cross-browser extension and Progressive Web App (PWA). This tool helps language learners acquire vocabulary by highlighting unlearned words directly on web pages and saving the sentence context.

The project is focusing on speed, UI fluidity, and simplicity.

---

## Key Features

### Desktop Extension (Chrome/Edge/Firefox)

* Scans the DOM using `TreeWalker` to highlight saved words without breaking page functionality.
* No persistent toolbars. Interactions occur via double-click or context menu.
  
**Smart Dashboard (Popup):**
* A Gamified header tracking total learned words.
* A clean, virtualized list of current vocabulary with phonetic transcriptions and parts of speech.
* Click any word to expand details (Audio pronunciation, Example Sentence).


### Mobile PWA

* Operates as a reader app. Users share articles from mobile browsers to MyVoc to strip ads and highlight vocabulary.
* Doubles as a review tool for saved words.

---

## Tech Stack

* **Frontend:** React, TypeScript, Vite (configured for CRXJS).
* **Styling:** Tailwind CSS + Daisy UI.
* **Backend:** ASP.NET Core (API for sync, definitions, and sentence mining).
* **Extension Core:** Manifest V3, Service Workers, `chrome.storage.local` for caching.

---

## UI/UX Specifications (MVP)

The user interface follows a "Less is More" philosophy to reduce cognitive load.

### The Popup Dashboard

1. **Header:**
* **Learned Word Counter:** A simple progress indicator (e.g., "1,240 Words Learned").
* **Sync Status:** Subtle indicator (Green dot for synced, Orange for offline).


2. **The List of learned/new words:**
* **Word**
* **POS**
* **Meaning**

3. **Detail View (Expanded State):**
* Triggered by clicking a list item.
* **Audio** Play button calling browser `window.speechSynthesis`.
* **Context:** Displays the sentence where the word was originally captured.

---

## Roadmap

* [ ] **Phase 1 (current):** React Popup UI (List & Details).
* [ ] **Phase 2:** Content Script Implementation (DOM Text Node highlighting).
* [ ] **Phase 3:** ASP.NET Backend Integration (Auth & Sync).
* [ ] **Phase 4:** Mobile PWA with Web Share Target API.
* [ ] **Phase 5:** Anki Export (.apkg) generation.
