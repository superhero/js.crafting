A library for backend engineers to craft reports without writing any frontend code...

# Screenshot

![Image](./docs/screenshot.png?raw=true)

# Run - CLI

To try,test the library, from the folder of the downloaded reposotory, type in the terminal:

```bash
npm install
npm start
```

Then go to the browser: http://localhost

If your port 80 and/or 8080 is busy, then you can change the port used by crafting by changing the values of the environment variables: 
 - **HTTP_PORT** <sub><sup> - default: 80</sup></sub>
 - **WS_PORT** <sub><sup> - default: 8080</sup></sub>

# Run - Docker <sub><sup>(optional)</sup></sub>

You can also build and run a docker image, if you preffer to use docker instead:

```bash
docker build -t crafting .
docker run -p 80:80 -p 8080:8080 -d crafting
```