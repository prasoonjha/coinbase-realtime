# Coinbase Real-time Data Visualization

This project demonstrates how to use Go goroutines to handle real-time data from Coinbase's WebSocket API and visualize it in a web interface.

## Features

- Connects to Coinbase WebSocket API
- Subscribes to real-time price updates for BTC-USD and ETH-USD
- Processes data using goroutines
- Visualizes price data in a real-time chart
- Provides a simple web interface

## Requirements

- Go 1.16 or higher
- Internet connection to access Coinbase WebSocket API

## Installation

1. Clone this repository or navigate to the project directory
2. Install dependencies:

```bash
go mod tidy
```

## Running the Application

1. Start the application:

```bash
go run main.go
```

2. Open your web browser and navigate to:

```
http://localhost:8080
```

3. You should see real-time price updates for BTC-USD and ETH-USD displayed in the chart.

## How It Works

- A goroutine connects to the Coinbase WebSocket API and subscribes to the "matches" channel
- When new price data is received, it's stored in a thread-safe data structure
- A web server provides an HTTP endpoint to fetch the latest data
- The web interface uses Chart.js to visualize the data and updates every second