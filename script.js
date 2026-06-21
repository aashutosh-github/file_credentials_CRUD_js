const os = require("os");
const fs = require("fs");
const path = require("path");

const CODE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".html",
  ".css",
  ".cpp",
  ".c",
  ".h",
  ".hpp",
  ".java",
  ".py",
  ".json",
  ".md",
]);

function valueOrMissing(value) {
  return value === undefined || value === "" ? "Not available" : value;
}

function getSystemInfo() {
  const cpus = os.cpus();

  return {
    operatingSystem: {
      type: valueOrMissing(os.type()),
      release: valueOrMissing(os.release()),
      version: valueOrMissing(os.version?.()),
    },
    cpu: {
      architecture: valueOrMissing(os.arch()),
      cores: cpus.length,
      model: valueOrMissing(cpus[0]?.model),
    },
    machine: {
      hostname: valueOrMissing(os.hostname()),
      platform: valueOrMissing(process.platform),
      homeDirectory: valueOrMissing(os.homedir()),
    },
    node: {
      version: valueOrMissing(process.version),
      executable: valueOrMissing(process.execPath),
    },
    environment: {
      USER: valueOrMissing(process.env.USER),
      HOME: valueOrMissing(process.env.HOME),
      SHELL: valueOrMissing(process.env.SHELL),
      PATH: valueOrMissing(process.env.PATH),
      LANG: valueOrMissing(process.env.LANG),
      PWD: valueOrMissing(process.env.PWD),
    },
  };
}

function printSystemInfo() {
  console.log(JSON.stringify(getSystemInfo(), null, 2));
}

function getSafeCodePath(filePath) {
  if (!filePath) {
    throw new Error("Please provide a file path.");
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  const projectRoot = process.cwd();
  const relativePath = path.relative(projectRoot, resolvedPath);
  const extension = path.extname(resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("File must be inside the current project folder.");
  }

  if (!CODE_EXTENSIONS.has(extension)) {
    throw new Error(
      `Only code/text files are allowed. Invalid extension: ${extension}`,
    );
  }

  return resolvedPath;
}

function createFile(filePath, content = "") {
  const safePath = getSafeCodePath(filePath);

  if (fs.existsSync(safePath)) {
    throw new Error("File already exists. Use update instead.");
  }

  fs.mkdirSync(path.dirname(safePath), { recursive: true });
  fs.writeFileSync(safePath, content);
  console.log(`Created: ${safePath}`);
}

function readFile(filePath) {
  const safePath = getSafeCodePath(filePath);
  console.log(fs.readFileSync(safePath, "utf8"));
}

function updateFile(filePath, content = "") {
  const safePath = getSafeCodePath(filePath);

  if (!fs.existsSync(safePath)) {
    throw new Error("File does not exist. Use create instead.");
  }

  fs.writeFileSync(safePath, content);
  console.log(`Updated: ${safePath}`);
}

function deleteFile(filePath) {
  const safePath = getSafeCodePath(filePath);

  if (!fs.existsSync(safePath)) {
    throw new Error("File does not exist.");
  }

  fs.unlinkSync(safePath);
  console.log(`Deleted: ${safePath}`);
}

function getValidHttpUrl(url) {
  if (!url) {
    throw new Error("Please provide a URL to send the system information to.");
  }

  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("URL must start with http:// or https://.");
  }

  return parsedUrl.toString();
}

async function sendSystemInfo(url) {
  const targetUrl = getValidHttpUrl(url);
  const payload = getSystemInfo();

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  console.log(`Sent system information to: ${targetUrl}`);
  console.log(`Status: ${response.status} ${response.statusText}`);

  if (responseText) {
    console.log("Response:");
    console.log(responseText.slice(0, 1000));
  }
}

function printHelp() {
  console.log(`
Usage:
  node Practice/script.js info
  node Practice/script.js send <url>
  node Practice/script.js create <file> <content>
  node Practice/script.js read <file>
  node Practice/script.js update <file> <content>
  node Practice/script.js delete <file>

Examples:
  node Practice/script.js info
  node Practice/script.js send https://example.com/collect
  node Practice/script.js create Practice/demo.js "console.log('Hello');"
  node Practice/script.js read Practice/demo.js
  node Practice/script.js update Practice/demo.js "console.log('Updated');"
  node Practice/script.js delete Practice/demo.js
`);
}

async function main() {
  const [command = "info", filePath, ...contentParts] = process.argv.slice(2);
  const content = contentParts.join(" ");

  try {
    if (command === "info") {
      printSystemInfo();
    } else if (command === "send") {
      await sendSystemInfo(filePath);
    } else if (command === "create") {
      createFile(filePath, content);
    } else if (command === "read") {
      readFile(filePath);
    } else if (command === "update") {
      updateFile(filePath, content);
    } else if (command === "delete") {
      deleteFile(filePath);
    } else {
      printHelp();
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
