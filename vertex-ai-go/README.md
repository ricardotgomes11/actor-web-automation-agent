# Vertex AI Generative AI Example (Go)

This folder contains a minimal example of using the Google Cloud Vertex AI Go SDK to generate text with the Gemini API.

The example follows the official quickstart in the [Vertex AI documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart#gen-ai-sdk-for-go).

## Files

- `main.go` – command-line tool that calls the `gemini-pro` model and prints the first candidate response.
- `go.mod` – module definition declaring the Vertex AI dependency.
- `Dockerfile` – container recipe so you can build and run the example anywhere.

## Usage

1. Ensure you have Go 1.20 or newer installed.
2. Set the `GOOGLE_CLOUD_PROJECT` environment variable to your Google Cloud project ID.
3. Authenticate with Google Cloud so the program can access Vertex AI (for example using `gcloud auth application-default login`).
4. Build and run the program. You can pass the prompt as arguments or via STDIN. Optional flags let you override the location and model:
   ```bash
   cd vertex-ai-go
   go run . --project=my-project --location=us-central1 --model=gemini-pro "Write a short poem about automation"

   # Or using STDIN
   echo "Tell me a joke" | go run . --project=my-project
   ```

### Docker

To build a container image and run it:

```bash
cd vertex-ai-go
docker build -t vertex-ai-example .
docker run -e GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT vertex-ai-example --model=gemini-pro "Tell me a joke"
```

The program will output the generated text from the model.

