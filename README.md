# KWin Scripts

Small KWin scripts for KDE Plasma 6.

| Script | Description |
|---|---|
| [Keep Above When Focused](keep-above-when-focused/) | Keeps chosen windows (by window class) above panels only while they have focus, so Alt+Tab keeps working. |

## Installation

From the KDE Store: System Settings → Window Management → KWin Scripts → Get New…, then search for the script name.

From source, using the script's folder:

```bash
kpackagetool6 --type=KWin/Script -i keep-above-when-focused
```

Then enable it in System Settings → Window Management → KWin Scripts. To update an installed script, use `-u` instead of `-i`.

## Packaging

A `.kwinscript` file is a zip archive of a script folder's contents:

```bash
cd keep-above-when-focused && python3 -m zipfile -c ../keep-above-when-focused.kwinscript metadata.json contents
```
