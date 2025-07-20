package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	coinbaseWSURL = "wss://ws-feed.exchange.coinbase.com"
)

// CoinbaseSubscription represents the subscription message
type CoinbaseSubscription struct {
	Type       string   `json:"type"`
	ProductIDs []string `json:"product_ids"`
	Channels   []string `json:"channels"`
}

// CoinbaseMessage represents the message received from Coinbase
type CoinbaseMessage struct {
	Type      string  `json:"type"`
	ProductID string  `json:"product_id"`
	Price     string  `json:"price"`
	Side      string  `json:"side"`
	Time      string  `json:"time"`
	Size      string  `json:"size"`
}

// PriceData stores price data for visualization
type PriceData struct {
	Timestamp time.Time
	Price     float64
	ProductID string
}

// DataStore stores the price data
type DataStore struct {
	sync.RWMutex
	Data map[string][]PriceData
}

// NewDataStore creates a new data store
func NewDataStore() *DataStore {
	return &DataStore{
		Data: make(map[string][]PriceData),
	}
}

// AddPrice adds a price to the data store
func (ds *DataStore) AddPrice(productID string, price float64) {
	ds.Lock()
	defer ds.Unlock()

	// Keep only the last 100 data points
	if len(ds.Data[productID]) >= 100 {
		ds.Data[productID] = ds.Data[productID][1:]
	}

	ds.Data[productID] = append(ds.Data[productID], PriceData{
		Timestamp: time.Now(),
		Price:     price,
		ProductID: productID,
	})
}

// GetPrices returns the prices for a product
func (ds *DataStore) GetPrices(productID string) []PriceData {
	ds.RLock()
	defer ds.RUnlock()

	result := make([]PriceData, len(ds.Data[productID]))
	copy(result, ds.Data[productID])
	return result
}

// GetLatestPrice returns the latest price for a product
func (ds *DataStore) GetLatestPrice(productID string) (float64, bool) {
	ds.RLock()
	defer ds.RUnlock()

	if len(ds.Data[productID]) == 0 {
		return 0, false
	}

	return ds.Data[productID][len(ds.Data[productID])-1].Price, true
}

var dataStore = NewDataStore()

func main() {
	// Products to subscribe to
	products := []string{"BTC-USD", "ETH-USD"}

	// Start WebSocket client in a goroutine
	go startWebSocketClient(products)

	// Start HTTP server for visualization
	http.HandleFunc("/", handleHome)
	http.HandleFunc("/data", handleData)

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func startWebSocketClient(products []string) {
	// Connect to WebSocket
	c, _, err := websocket.DefaultDialer.Dial(coinbaseWSURL, nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	// Subscribe to the match channel for the products
	subscription := CoinbaseSubscription{
		Type:       "subscribe",
		ProductIDs: products,
		Channels:   []string{"matches"},
	}

	err = c.WriteJSON(subscription)
	if err != nil {
		log.Fatal("subscribe:", err)
	}

	fmt.Println("Connected to Coinbase WebSocket and subscribed to:", products)

	// Read messages in a loop
	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			return
		}

		var msg CoinbaseMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Println("unmarshal error:", err)
			continue
		}

		// Process only match messages with price
		if msg.Type == "match" && msg.Price != "" {
			var price float64
			fmt.Sscanf(msg.Price, "%f", &price)
			
			dataStore.AddPrice(msg.ProductID, price)
			fmt.Printf("Product: %s, Price: %.2f, Side: %s\n", msg.ProductID, price, msg.Side)
		}
	}
}

func handleHome(w http.ResponseWriter, r *http.Request) {
	html := `
<!DOCTYPE html>
<html>
<head>
    <title>Coinbase Real-time Price Visualization</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .chart-container { height: 400px; margin-bottom: 30px; }
        .price-display { font-size: 24px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Coinbase Real-time Price Visualization</h1>
        
        <div class="price-display">
            <div id="btc-price">BTC-USD: Loading...</div>
            <div id="eth-price">ETH-USD: Loading...</div>
        </div>
        
        <div class="chart-container">
            <canvas id="priceChart"></canvas>
        </div>
    </div>

    <script>
        // Initialize chart
        const ctx = document.getElementById('priceChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'BTC-USD',
                        data: [],
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: 'ETH-USD',
                        data: [],
                        borderColor: 'rgb(54, 162, 235)',
                        tension: 0.1,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Price (USD)'
                        }
                    }
                }
            }
        });

        // Function to format time
        function formatTime(date) {
            return date.toLocaleTimeString();
        }

        // Function to update chart with new data
        function updateChart(data) {
            // Clear existing data
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.data.datasets[1].data = [];
            
            // Add BTC data
            if (data['BTC-USD'] && data['BTC-USD'].length > 0) {
                data['BTC-USD'].forEach(point => {
                    chart.data.labels.push(formatTime(new Date(point.Timestamp)));
                    chart.data.datasets[0].data.push(point.Price);
                });
                
                // Update price display
                document.getElementById('btc-price').textContent = 'BTC-USD: $' + data['BTC-USD'][data['BTC-USD'].length - 1].Price.toFixed(2);
            }
            
            // Add ETH data
            if (data['ETH-USD'] && data['ETH-USD'].length > 0) {
                // We only need to add labels from one dataset
                data['ETH-USD'].forEach(point => {
                    chart.data.datasets[1].data.push(point.Price);
                });
                
                // Update price display
                document.getElementById('eth-price').textContent = 'ETH-USD: $' + data['ETH-USD'][data['ETH-USD'].length - 1].Price.toFixed(2);
            }
            
            chart.update();
        }

        // Fetch data every second
        function fetchData() {
            fetch('/data')
                .then(response => response.json())
                .then(data => {
                    updateChart(data);
                })
                .catch(error => console.error('Error fetching data:', error));
        }

        // Initial fetch and set interval
        fetchData();
        setInterval(fetchData, 1000);
    </script>
</body>
</html>
`
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}

func handleData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Get data for each product
	data := map[string][]PriceData{
		"BTC-USD": dataStore.GetPrices("BTC-USD"),
		"ETH-USD": dataStore.GetPrices("ETH-USD"),
	}
	
	json.NewEncoder(w).Encode(data)
}