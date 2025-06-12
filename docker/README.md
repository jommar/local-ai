# 🧠 Ollama + Open WebUI (Docker Compose Setup)

This project sets up [Ollama](https://ollama.com) with [Open WebUI](https://github.com/open-webui/open-webui) using Docker Compose, with persistent data stored on a preferred directory. It also includes GPU support for Ollama inference.

## 📦 Requirements

* Docker
* Docker Compose
* NVIDIA GPU with a supported driver (e.g. Driver Version ≥ 450, CUDA ≥ 11)
* [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) installed and configured for Docker

## ⚙️ Enable GPU Support

1. **Verify your GPU driver**

   ```bash
   nvidia-smi
   ```

   You should see your GPU (e.g., RTX 4060) and driver details.

2. **Install NVIDIA Container Toolkit** (if not already installed)

   ```bash
   # Add GPG key and repository
   curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
     | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
   curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
     | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
     | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   sudo nvidia-ctk runtime configure --runtime=docker
   sudo systemctl restart docker
   ```

3. **Test Docker GPU access**

   ```bash
   docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
   ```

   You should see your GPU listed inside the container.

> **Note:** The provided `docker-compose.yml` is pre-configured with `runtime: nvidia` for the Ollama service to leverage GPU.

## 🚀 How to Use

1. **Clone or copy this folder to your preferred directory**

   Example path:

   ```bash
   /mnt/34b710d8-4fad-4cee-93d1-2fc8815a5df5/ollama
   ```

2. **Start the services**

   Open a terminal in this folder and run:

   ```bash
   docker-compose up -d --remove-orphans
   ```

3. **Verify Ollama sees the GPU**

   ```bash
   docker exec -it ollama nvidia-smi
   ```

   Look for your GPU in the container’s process list.

4. **Access the Web UI**

   Open your browser and go to:

   ```text
   http://localhost:4086
   ```

5. **Pull a model (optional)**

   Run this to pull LLaMA 3:

   ```bash
   docker exec -it ollama ollama pull llama3
   ```

6. **Run an inference on GPU**

   ```bash
   docker exec -it ollama ollama run llama3:latest --prompt "Hello, GPU!"
   ```

   While it’s running, monitor GPU usage on the host:

   ```bash
   watch -n 1 nvidia-smi
   ```

7. **Chat and explore locally**

   All interactions are private and run on your machine.

## 🗃 Directory Structure

| Path                 | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `./ollama-data`      | Stores models and config from Ollama             |
| `./open-webui-data`  | Stores chat history and settings from Open WebUI |
| `docker-compose.yml` | Main Docker setup file                           |

## 🔧 Optional Alias

Add an alias for easier CLI access to Ollama:

```bash
alias ollama="docker exec -it ollama ollama"
```

Add this to your `~/.bashrc` or `~/.zshrc`.

## 📤 Stop the services

```bash
docker-compose down
```

## ✅ Credits

* [Ollama](https://ollama.com)
* [Open WebUI](https://github.com/open-webui/open-webui)
