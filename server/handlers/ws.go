package handlers

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

type Hub struct {
	// Map user IDs to their websocket connections
	clients map[int]*websocket.Conn
	mu      sync.Mutex
}

var GlobalHub = &Hub{
	clients: make(map[int]*websocket.Conn),
}

// HandleWS upgrades the connection and registers the client in the hub
func (h *Hub) HandleWS(c echo.Context) error {
	userID := c.Get("user_id").(int)

	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	h.mu.Lock()
	h.clients[userID] = conn
	h.mu.Unlock()

	fmt.Printf("User %d connected via WebSocket\n", userID)

	// Keep connection alive and handle disconnection
	defer func() {
		h.mu.Lock()
		delete(h.clients, userID)
		h.mu.Unlock()
		conn.Close()
		fmt.Printf("User %d disconnected from WebSocket\n", userID)
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}

	return nil
}

// SendNotification sends a message to a specific user if they are connected
func (h *Hub) SendNotification(userID int, message interface{}) {
	h.mu.Lock()
	conn, ok := h.clients[userID]
	h.mu.Unlock()

	if ok {
		conn.WriteJSON(message)
	}
}
