# System Info and File CRUD Tool

This project contains a Node.js command-line tool in `script.js`.

It can:

- Gather system information from the current computer.
- Display the information as structured JSON.
- Send the collected information to another URL using an HTTP `POST` request.
- Create, read, update, and delete code/text files inside the current project folder.

## Requirements

- Node.js 18 or newer.
- No external npm packages are required.

## Data Flow

### `info` command

```text
User runs command
  -> script.js starts
  -> Node.js reads system data using os and process
  -> missing values are replaced with "Not available"
  -> data is converted to JSON
  -> JSON is printed in the terminal
```

Data sources:

- `os.type()` for operating system type.
- `os.release()` for OS release.
- `os.version()` for OS version.
- `os.arch()` for CPU architecture.
- `os.cpus()` for CPU model and core count.
- `os.hostname()` for hostname.
- `os.homedir()` for home directory.
- `process.version` for Node.js version.
- `process.platform` for platform.
- `process.env` for selected environment variables.

### `send` command

```text
User runs command with a URL
  -> script.js gathers the same system data as info
  -> data is converted to JSON
  -> fetch sends an HTTP POST request to the URL
  -> remote server receives the JSON body
  -> response status and response text are printed in the terminal
```

The request uses this format:

```http
POST <url>
Content-Type: application/json
```

The request body is the collected system information as JSON.

### File CRUD commands

```text
User runs create/read/update/delete
  -> script.js validates the file path
  -> file must stay inside the current project folder
  -> file extension must be a known code/text extension
  -> fs module performs the requested file operation
  -> result is printed in the terminal
```

Allowed extensions include:

```text
.js, .jsx, .ts, .tsx, .html, .css, .cpp, .c, .h, .hpp, .java, .py, .json, .md
```

## Commands

Run these commands from the project folder after cloning or downloading the repository:

```bash
cd ./
```

### Show system information

```bash
node script.js info
```

You can also run the file without a command. It defaults to `info`:

```bash
node script.js
```

### Send system information to a URL

```bash
node script.js send https://example.com/collect
```

Replace `https://example.com/collect` with the real endpoint where you want to receive the data.

For testing with a public request inspector, you can use a webhook/request-bin style URL and run:

```bash
node script.js send <your-webhook-url>
```

Only send this data to URLs you trust. The output can include usernames, home directory paths, shell path, and environment information.

### Create a code file

```bash
node script.js create demo.js "console.log('Hello');"
```

### Read a code file

```bash
node script.js read demo.js
```

### Update a code file

```bash
node script.js update demo.js "console.log('Updated');"
```

### Delete a code file

```bash
node script.js delete demo.js
```

## Local Send Test

You can test the `send` command locally with a tiny Node.js receiver.

Create a temporary server file:

```bash
node script.js create receiver.js "const http = require('http'); const server = http.createServer((req, res) => { let body = ''; req.on('data', chunk => body += chunk); req.on('end', () => { console.log('Received:', body); res.end('OK'); }); }); server.listen(3000, () => console.log('Listening on http://localhost:3000'));"
```

Start the receiver in one terminal:

```bash
node receiver.js
```

In another terminal, send the system information:

```bash
node script.js send http://localhost:3000
```

You should see the JSON payload printed in the receiver terminal and a `200 OK` status in the sender terminal.

After testing, delete the receiver file:

```bash
node script.js delete receiver.js
```

## Error Handling

The tool handles common errors by printing clear messages, for example:

- Missing file path.
- Missing URL.
- Invalid URL protocol.
- File outside the current project folder.
- Unsupported file extension.
- Trying to create a file that already exists.
- Trying to update or delete a file that does not exist.

Missing system or environment values are shown as:

```text
Not available
```
