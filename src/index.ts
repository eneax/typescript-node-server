import http, { IncomingMessage, ServerResponse } from "http";
import path from "path";
import fs from "fs/promises";
import axios from "axios";

interface Joke {
  id: string;
  joke: string;
  status: string;
}

async function requestListener(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = new URL(req.url || "", "http://localhost:3000");

  let data = "";
  let statusCode = 200;

  try {
    let pathName = parsedUrl.pathname;
    if (pathName === "/") pathName = "/index";

    const filePath = path.join(__dirname, `static${pathName}.html`);
    data = await fs.readFile(filePath, "utf-8");
  } catch (error) {
    data = await fs.readFile(path.join(__dirname, "static/404.html"), "utf-8");
    statusCode = 404;
  }

  // Special handling of the dad joke path
  if (parsedUrl.pathname === "/dad-joke") {
    const response = await axios.get("https://icanhazdadjoke.com", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Node Server",
      },
    });

    const joke: Joke = await response.data;
    data = data.replace(/{{joke}}/gm, joke.joke);
  }

  res.writeHead(statusCode, {
    "Content-Type": "text/html",
    "Content-Length": data.length,
  });
  res.write(data);
  res.end();
}

http.createServer(requestListener).listen(3000, () => {
  console.log("HTTP Server listening on port 3000...");
});
