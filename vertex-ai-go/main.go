package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"os"
	"strings"

	genai "cloud.google.com/go/vertexai/genai"
)

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func main() {
	ctx := context.Background()

	// Command line flags with environment variable fallbacks
	projectFlag := flag.String("project", os.Getenv("GOOGLE_CLOUD_PROJECT"), "Google Cloud project ID")
	locationFlag := flag.String("location", getEnv("GOOGLE_CLOUD_LOCATION", "us-central1"), "Vertex AI location")
	modelFlag := flag.String("model", getEnv("VERTEX_MODEL", "gemini-pro"), "Model name to query")
	flag.Parse()

	if *projectFlag == "" {
		fmt.Println("project ID must be specified via --project or GOOGLE_CLOUD_PROJECT")
		return
	}

	projectID := *projectFlag
	location := *locationFlag

	client, err := genai.NewClient(ctx, projectID, location)
	if err != nil {
		panic(err)
	}
	defer client.Close()

	model := client.GenerativeModel(*modelFlag)

	// Determine the prompt. Remaining command line args take priority.
	args := flag.Args()
	var prompt string
	if len(args) > 0 {
		prompt = strings.Join(args, " ")
	} else {
		info, err := os.Stdin.Stat()
		if err == nil && (info.Mode()&os.ModeCharDevice) == 0 {
			in := bufio.NewScanner(os.Stdin)
			var b strings.Builder
			for in.Scan() {
				b.WriteString(in.Text())
				b.WriteByte('\n')
			}
			prompt = b.String()
		} else {
			prompt = "Hello from Vertex AI"
		}
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		panic(err)
	}

	fmt.Println(resp.Candidates[0].Content)
}
