# KWin Scripts

Small KWin scripts for KDE Plasma 6.

| Script | Description |
|---|---|
| [Keep Above When Focused](keep-above-when-focused/) | Keeps a window above panels only while it has focus, so Alt+Tab keeps working. Applies to all windows, or only to chosen window classes. |

## Installation

From the KDE Store: System Settings → Window Management → KWin Scripts → Get New…, then search for the script name.

From source, using the script's folder:

```bash
kpackagetool6 --type=KWin/Script -i keep-above-when-focused
```

Then enable it in System Settings → Window Management → KWin Scripts. To update an installed script, use `-u` instead of `-i`.

## Changing settings

KWin does not pass new settings to a running script. After changing a script's settings, turn the script off and on again in System Settings → Window Management → KWin Scripts (click Apply each time), or log in again.

## Packaging

A `.kwinscript` file is a zip archive of a script folder's contents:

```bash
cd keep-above-when-focused && python3 -m zipfile -c ../keep-above-when-focused.kwinscript metadata.json contents
```
