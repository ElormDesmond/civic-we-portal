package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

type PermitHandler struct {
	DB *sql.DB
}

type PermitSubmission struct {
	PermitType string          `json:"permit_type"`
	Payload    json.RawMessage `json:"payload"`
}

type PermitApplication struct {
	ID         int             `json:"id"`
	UserID     int             `json:"user_id"`
	PermitType string          `json:"permit_type"`
	Status     string          `json:"status"`
	Payload    json.RawMessage `json:"payload"`
	CreatedAt  string          `json:"created_at"`
	UpdatedAt  string          `json:"updated_at"`
}

// SubmitPermit handles the submission of a new permit application
func (h *PermitHandler) SubmitPermit(c echo.Context) error {
	userID := c.Get("user_id").(int)

	req := new(PermitSubmission)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	_, err := h.DB.Exec("INSERT INTO permits (user_id, permit_type, payload) VALUES ($1, $2, $3)",
		userID, req.PermitType, req.Payload)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to submit permit application"})
	}

	return c.JSON(http.StatusCreated, map[string]string{"message": "Permit application submitted successfully"})
}

// GetMyPermits returns all permit applications for the current user
func (h *PermitHandler) GetMyPermits(c echo.Context) error {
	userID := c.Get("user_id").(int)

	rows, err := h.DB.Query("SELECT id, user_id, permit_type, status, payload, created_at, updated_at FROM permits WHERE user_id = $1 ORDER BY created_at DESC", userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch your permit applications"})
	}
	defer rows.Close()

	var permits []PermitApplication
	for rows.Next() {
		var p PermitApplication
		if err := rows.Scan(&p.ID, &p.UserID, &p.PermitType, &p.Status, &p.Payload, &p.CreatedAt, &p.UpdatedAt); err != nil {
			continue
		}
		permits = append(permits, p)
	}

	return c.JSON(http.StatusOK, permits)
}

// GetAllPermits returns all permit applications for admin review
func (h *PermitHandler) GetAllPermits(c echo.Context) error {
	// We join with the users table to get the applicant's name
	rows, err := h.DB.Query(`
		SELECT p.id, p.user_id, u.full_name, p.permit_type, p.status, p.payload, p.created_at 
		FROM permits p 
		JOIN users u ON p.user_id = u.id 
		ORDER BY p.created_at DESC`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch permit applications"})
	}
	defer rows.Close()

	type AdminPermitView struct {
		ID         int             `json:"id"`
		UserID     int             `json:"user_id"`
		FullName   string          `json:"full_name"`
		PermitType string          `json:"permit_type"`
		Status     string          `json:"status"`
		Payload    json.RawMessage `json:"payload"`
		CreatedAt  string          `json:"created_at"`
	}

	var permits []AdminPermitView
	for rows.Next() {
		var p AdminPermitView
		if err := rows.Scan(&p.ID, &p.UserID, &p.FullName, &p.PermitType, &p.Status, &p.Payload, &p.CreatedAt); err != nil {
			continue
		}
		permits = append(permits, p)
	}

	return c.JSON(http.StatusOK, permits)
}

// UpdatePermitStatus allows admins to approve or reject a permit
func (h *PermitHandler) UpdatePermitStatus(c echo.Context) error {
	id := c.Param("id")
	type StatusReq struct {
		Status string `json:"status"` // approved or rejected
	}

	req := new(StatusReq)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	if req.Status != "approved" && req.Status != "rejected" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid status value"})
	}

	// Fetch user_id and permit_type to send notification
	var userID int
	var permitType string
	err := h.DB.QueryRow("SELECT user_id, permit_type FROM permits WHERE id = $1", id).Scan(&userID, &permitType)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch permit details"})
	}

	_, err = h.DB.Exec("UPDATE permits SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", req.Status, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update permit status"})
	}

	// Send real-time notification
	GlobalHub.SendNotification(userID, map[string]string{
		"type":    "PERMIT_STATUS_UPDATE",
		"message": fmt.Sprintf("Your %s application has been %s", permitType, req.Status),
		"status":  req.Status,
	})

	return c.JSON(http.StatusOK, map[string]string{"message": "Permit status updated successfully"})
}
