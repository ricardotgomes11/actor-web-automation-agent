# Integrating Scriptable with Shortcuts on iOS

This guide explains how to combine the **Scriptable** app with **Shortcuts** on your iPhone so you can automate tasks using JavaScript and trigger them via the Shortcuts app.

## Prerequisites

- **Scriptable** installed from the App Store
- **Shortcuts** app available on iOS

## Creating a Scriptable script

1. Open **Scriptable** and create a new script.
2. Write your automation logic in JavaScript. For example, to display a greeting:

   ```javascript
   const name = args.shortcutParameter || "World";
   const alert = new Alert();
   alert.title = `Hello, ${name}!`;
   await alert.present();
   ```

3. Tap **Done** to save the script. Note the script name.

## Exposing the script to Shortcuts

1. Open the **Shortcuts** app and create a new shortcut.
2. Add the **Run Script** action from Scriptable.
3. Select your script and optionally pass input via the *Script Input* field.
4. Use additional Shortcuts actions before or after running the script to chain functionality together.

## Optimizing usage

- Scriptable exposes many iOS APIs (files, calendar, reminders, etc.). Explore the in-app documentation for modules relevant to your workflow.
- Shortcuts can schedule automations or react to system events (e.g., time of day, NFC tag scans). Combine these triggers with Scriptable for powerful automation.
- Keep scripts short and focused. Offload heavy tasks to multiple scripts or shortcuts to maintain performance.

## Example: Append to a Note

The following script appends text to a note in the Notes app. You can trigger it from Shortcuts with a text parameter:

```javascript
const text = args.shortcutParameter;
if (text) {
  const fm = FileManager.iCloud();
  const dir = fm.documentsDirectory();
  const path = fm.joinPath(dir, "ShortcutNotes.txt");
  let existing = "";
  if (fm.fileExists(path)) existing = fm.readString(path);
  fm.writeString(path, existing + "\n" + text);
}
```

This script stores notes in iCloud Drive. You could extend it to use other Scriptable APIs, such as Calendar or Reminders.

## Further resources

- [Scriptable documentation](https://docs.scriptable.app/)
- [Apple Shortcuts User Guide](https://support.apple.com/guide/shortcuts/welcome/ios)

