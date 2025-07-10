FROM golang:1.20 as builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o app .

FROM gcr.io/distroless/base-debian11
WORKDIR /app
COPY --from=builder /app/app /app/app
ENTRYPOINT ["/app/app"]
