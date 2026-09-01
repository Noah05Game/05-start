# Adding a New Slash Command

This project uses the `COMMANDS` array in `src/App.jsx` to define slash commands.

## 1. Add the command to `COMMANDS`

Open:

```text
src/App.jsx
```

Find:

```js
const COMMANDS = [
```

Add a new object:

```js
{
  command: "/spotify",
  name: "Spotify",
  type: "redirect",
  color: "spotify",
  description: "Search Spotify",
},
```

Change the values to match your command.

### Properties

| Property      | Purpose                                             |
| ------------- | --------------------------------------------------- |
| `command`     | The slash command, e.g. `/spotify`                  |
| `name`        | Name displayed in the search bar/menu               |
| `type`        | Usually `redirect`; can be used for custom commands |
| `color`       | CSS class used for the command's colour             |
| `description` | Small description shown in the command menu         |

---

## 2. Add what the command actually does

Find:

```js
function runCommand(command, query) {
```

Add your command inside this function.

For a redirect command:

```js
if (command.color === "spotify") {
  window.location.href =
    `https://open.spotify.com/search/${encodeURIComponent(
      query
    )}`

  return
}
```

Replace the URL with the appropriate search URL.

### Example

For a Google search:

```js
if (command.color === "google") {
  window.location.href =
    `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}`

  return
}
```

---

# 3. Add the command colour

Open:

```text
src/App.css
```

Add:

```css
.search.spotify {
  border-color: rgba(30, 215, 96, 0.6);
}

.search.spotify .search-icon,
.search.spotify .search-mode {
  color: #1ed760;
}

.command-dot.spotify {
  background: #1ed760;
}
```

Replace `spotify` with your command's `color` value.

You can use any colour you want.

For example:

```css
.search.example {
  border-color: rgba(120, 90, 255, 0.6);
}

.search.example .search-icon,
.search.example .search-mode {
  color: #785aff;
}

.command-dot.example {
  background: #785aff;
}
```

---

# 4. That's it

The existing command system automatically handles:

* Typing `/`
* Typing the first letter to open the command menu
* Filtering commands
* Highlighting commands
* Clicking commands
* Arrow-key navigation
* Tab to select a command
* Adding the space after the command
* Detecting the active command
* Showing the command name in the search bar
* Applying the command colour

You do **not** need to modify the command-menu logic.

---

# Internal Commands

Some commands don't redirect to another website.

For example:

```text
/calc 25 * 4
```

Instead of opening a website, the result appears directly on the start page.

For an internal command, add it to `COMMANDS`:

```js
{
  command: "/example",
  name: "Example",
  type: "example",
  color: "example",
  description: "Run an internal action",
},
```

Then add its behaviour inside:

```js
function runCommand(command, query) {
```

Example:

```js
if (command.color === "example") {
  // Your custom functionality here

  return
}
```

You can then create a result UI in the React component.

---

# Important

Every command needs a unique:

```js
command
```

and preferably a unique:

```js
color
```

For example:

```js
/amazon
/youtube
/maps
/spotify
```

Do not create two commands with the same command name.

---

# Quick Checklist

When adding a command, check:

* [ ] Added command to `COMMANDS`
* [ ] Added behaviour to `runCommand()`
* [ ] Added CSS for the command
* [ ] Added `.command-dot.<color>` CSS
* [ ] Tested typing `/<command>`
* [ ] Tested pressing Space after the command
* [ ] Tested an actual search
* [ ] Tested deleting the command
* [ ] Tested Tab selection

## Example Complete Command

### App.jsx

```js
{
  command: "/spotify",
  name: "Spotify",
  type: "redirect",
  color: "spotify",
  description: "Search Spotify",
},
```

And:

```js
if (command.color === "spotify") {
  window.location.href =
    `https://open.spotify.com/search/${encodeURIComponent(
      query
    )}`

  return
}
```

### App.css

```css
.search.spotify {
  border-color: rgba(30, 215, 96, 0.6);
}

.search.spotify .search-icon,
.search.spotify .search-mode {
  color: #1ed760;
}

.command-dot.spotify {
  background: #1ed760;
}
```

Now:

```text
/spotify
```

becomes:

```text
/spotify [Spotify]
```

after selecting it, and:

```text
/spotify minecraft music
```

searches Spotify.
