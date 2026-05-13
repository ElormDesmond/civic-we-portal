package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/labstack/echo/v4"
)

type UploadHandler struct{}

// HandleUpload saves a file to a nested directory based on the 'type' query parameter
func (h *UploadHandler) HandleUpload(c echo.Context) error {
	// Get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "No file provided"})
	}

	// Determine the upload type (news, officials, etc.)
	uploadType := c.QueryParam("type")
	if uploadType == "" {
		uploadType = "general"
	}

	// Ensure the directory exists
	uploadDir := filepath.Join("uploads", uploadType)
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create upload directory"})
	}

	// Create a unique filename
	filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
	dstPath := filepath.Join(uploadDir, filename)

	// Source
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// Destination
	dst, err := os.Create(dstPath)
	if err != nil {
		return err
	}
	defer dst.Close()

	// Copy the file content
	if _, err = io.Copy(dst, src); err != nil {
		return err
	}

	// Return the accessible URL
	url := fmt.Sprintf("/uploads/%s/%s", uploadType, filename)
	return c.JSON(http.StatusOK, map[string]string{
		"url": url,
	})
}
