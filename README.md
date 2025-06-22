# 🧠 Local AI

This app is a local AI-powered tool that integrates web search, chat interfaces, and LLM inference — all running locally using Docker.

<div>
  <img src="./assets/welcome.png" alt="Welcome" width="400" />
  <img src="./assets/chat.png" alt="Welcome" width="400" />
  <img src="./assets/history.png" alt="Welcome" width="400" />
</div>

---

## 📦 Requirements

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v22 or later recommended)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 🗂 Project Structure

The project is organized into three main parts:

```
/frontend   - Nuxt 3 app (UI)
/backend    - Express server (API)
/docker     - Contains all required containers and configurations
```

---

## 🚀 Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jommar/local-ai.git
   cd local-ai
   ```

2. **Start required containers:**

   Go to the `docker/` directory and run:

   ```bash
   docker-compose up -d
   ```

   This will start the following containers:

   | Container Name | Image                                | Port                     |
   | -------------- | ------------------------------------ | ------------------------ |
   | open-webui     | `ghcr.io/open-webui/open-webui:main` | `http://localhost:4086`  |
   | searxng        | `searxng/searxng:latest`             | `http://localhost:3087`  |
   | ollama         | `ollama/ollama:latest`               | `http://localhost:11434` |

3. **Configure environment variables:**

   - Copy and customize the example config files:

     ```bash
     cp backend/config.json.example backend/config.json
     cp frontend/.env.example frontend/.env
     ```

   - Edit values as needed.

4. **Update SearXNG settings:**

   Open and edit `docker/searxng-settings/settings.yml` and ensure the following line is included to support JSON responses:

   ```yaml
   formats:
     - html
     - json
   ```

5. **Start the app:**

   At the root of the project, run:

   ```bash
   npm run start
   ```

   This will start **both** frontend and backend concurrently.

---

## 💠 Development Tips

- Make sure containers are up before running the app.
- If you need to rebuild containers:
  ```bash
  docker-compose down
  docker-compose up --build -d
  ```
