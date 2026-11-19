/*
 * Keep Above When Focused
 *
 * Keeps matching windows above panels and other windows, but only while
 * they have focus. As soon as another window is activated (Alt+Tab, a
 * click...), the window goes back to the normal stacking layer.
 *
 * SPDX-License-Identifier: GPL-2.0-only
 */

let windowClasses = [];
let exactMatch = false;

// The window this script set to "keep above". Only this change is undone,
// so a window the user already keeps above is never touched.
let raisedWindow = null;

function loadConfig() {
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

function matches(window) {
    if (!window || !window.normalWindow || windowClasses.length === 0) {
        return false;
    }
    const ids = windowIds(window);
    return windowClasses.some(function (pattern) {
        return ids.some(function (id) {
            return exactMatch ? id === pattern : id.includes(pattern);
        });
    });
}

function release() {
    if (raisedWindow) {
        raisedWindow.keepAbove = false;
        raisedWindow = null;
    }
}

function onWindowActivated(window) {
    if (window && window === raisedWindow) {
        return;
    }
    release();
    if (matches(window) && !window.keepAbove) {
        window.keepAbove = true;
        raisedWindow = window;
    }
}

function onWindowRemoved(window) {
    if (window === raisedWindow) {
        raisedWindow = null;
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
