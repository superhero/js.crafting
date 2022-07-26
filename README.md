# Crafting

Licence: [MIT](https://opensource.org/licenses/MIT)

----

[![npm version](https://badge.fury.io/js/crafting.svg)](https://badge.fury.io/js/crafting)

----

A library for backend engineers to craft reports without writing any frontend code...

# Screenshot

![Image](./docs/screenshot.png?raw=true)

# Run - CLI

To try/test the library, from the folder of the downloaded reposotory, type in the terminal:

```bash
npm install
npm start
```

Then go to the browser: http://localhost

----

If your port 80 and/or 8080 is busy, then you can change the port used by crafting by changing the values of the environment variables: 
 - **HTTP_PORT** <sub><sup> - default: 80</sup></sub>
 - **WS_PORT** <sub><sup> - default: 8080</sup></sub>
 
 To specify the websocket host:
 - **WS_HOST**

# Run - Docker <sub><sup>(optional)</sup></sub>

You can also build and run a docker image, if you preffer to use docker instead:

```bash
docker build -t crafting .
docker run -p 80:80 -p 8080:8080 -d crafting
```

---

# How to use

In your nodejs application, install the package through npm: `npm install crafting`, or simply by defining the dependency in your package.json file:

```json
{
  "dependencies":
  {
    "superhero": "*"
  }
}
```
