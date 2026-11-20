/*
 * Keep Above When Focused
 *
 * Keeps matching windows above panels and other windows, but only while
 * they have focus. As soon as another window is activated (Alt+Tab, a
 * click...), the window goes back to the normal stacking layer.
 *
 * Two modes: every window matches, or only the windows whose class is in
 * a list match (the default).
 *
 * SPDX-License-Identifier: GPL-2.0-only
 */

let allWindows = false;
let windowClasses = [];
let exactMatch = false;

// The window this script set to "keep above". Only this change is undone,
// so a window the user already keeps above is never touched.
let raisedWindow = null;

function loadConfig() {
    // The settings page stores the name of the chosen mode.
    allWindows = String(readConfig("Mode", "WindowClasses")).toLowerCase() === "allwindows";

    windowClasses = String(readConfig("WindowClasses", "gamescope"))
        .split(",")
        .map(function (entry) { return entry.trim().toLowerCase(); })
        .filter(function (entry) { return entry.length > 0; });

    const exact = readConfig("ExactMatch", false);
    exactMatch = exact === true || String(exact).toLowerCase() === "true";
}

function windowIds(window) {
    return [window.resourceClass, window.resourceName, window.desktopFileName]
        .map(function (value) { return String(value || "").toLowerCase(); })
        .filter(function (value) { return value.length > 0; });
}

function classMatches(window) {
    const ids = windowIds(window);
    return windowClasses.some(function (pattern) {
        return ids.some(function (id) {
            return exactMatch ? id === pattern : id.includes(pattern);
        });
    });
}

function matches(window) {
    // Turning "keep above" on turns "keep below" off, so windows kept
    // below are left alone.
    if (!window || !window.normalWindow || window.keepBelow) {
        return false;
    }
    return allWindows || classMatches(window);
}

// Whether window is a dialog of parent, directly or through other dialogs.
// The depth limit guards against a loop in the chain.
function isDialogOf(window, parent) {
    let current = window.transientFor;
    for (let depth = 0; current && depth < 16; depth++) {
        if (current === parent) {
            return true;
        }
        current = current.transientFor;
    }
    return false;
}

// Stops tracking the raised window without touching it. Connected to its
// keepAboveChanged signal: if the user or the application changes
// "keep above" on it, their choice is kept.
function forget() {
    if (raisedWindow) {
        raisedWindow.keepAboveChanged.disconnect(forget);
        raisedWindow = null;
    }
}

function raise(window) {
    window.keepAbove = true;
    raisedWindow = window;
    window.keepAboveChanged.connect(forget);
}

function release() {
    const window = raisedWindow;
    forget();
    if (window) {
        window.keepAbove = false;
    }
}

function onWindowActivated(window) {
    // KWin keeps dialogs above their parent window, so the raised window
    // stays raised while one of its dialogs has focus.
    if (window && raisedWindow && (window === raisedWindow || isDialogOf(window, raisedWindow))) {
        return;
    }
    release();
    if (matches(window) && !window.keepAbove) {
        raise(window);
    }
}

function onWindowRemoved(window) {
    if (window === raisedWindow) {
        forget();
    }
}

function reload() {
    release();
    loadConfig();
    onWindowActivated(workspace.activeWindow);
}

loadConfig();
workspace.windowActivated.connect(onWindowActivated);
workspace.windowRemoved.connect(onWindowRemoved);
options.configChanged.connect(reload);
onWindowActivated(workspace.activeWindow);
