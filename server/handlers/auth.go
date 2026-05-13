package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB *sql.DB
}

// Claims defines the JWT payload structure
type Claims struct {
	UserID int    `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

var jwtSecret = []byte("development-secret-key") // TODO: Move to env var

// Register handles new citizen registration
func (h *AuthHandler) Register(c echo.Context) error {
	type RegisterReq struct {
		FullName string `json:"full_name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	req := new(RegisterReq)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	// Hash the password for security
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not hash password"})
	}

	// Insert the new user into the database
	_, err = h.DB.Exec("INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
		req.FullName, req.Email, string(hashedPassword), "citizen")
	if err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": "Email already exists or database error"})
	}

	return c.JSON(http.StatusCreated, map[string]string{"message": "User registered successfully"})
}

// Login authenticates a user and sets an HTTP-Only cookie with the JWT
func (h *AuthHandler) Login(c echo.Context) error {
	type LoginReq struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	req := new(LoginReq)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	var id int
	var fullName, role, passwordHash string
	err := h.DB.QueryRow("SELECT id, full_name, role, password_hash FROM users WHERE email = $1", req.Email).
		Scan(&id, &fullName, &role, &passwordHash)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
	}

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
	}

	// Generate JWT token
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: id,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not generate token"})
	}

	// Set the token in an HTTP-Only cookie
	cookie := new(http.Cookie)
	cookie.Name = "auth_token"
	cookie.Value = tokenString
	cookie.Expires = expirationTime
	cookie.HttpOnly = true
	cookie.Path = "/"
	// cookie.Secure = true // Enable this in production with HTTPS
	cookie.SameSite = http.SameSiteLaxMode
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":        id,
		"full_name": fullName,
		"role":      role,
	})
}

// Logout clears the auth token cookie
func (h *AuthHandler) Logout(c echo.Context) error {
	cookie := new(http.Cookie)
	cookie.Name = "auth_token"
	cookie.Value = ""
	cookie.Expires = time.Now().Add(-1 * time.Hour) // Expire immediately
	cookie.HttpOnly = true
	cookie.Path = "/"
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// Me returns the current authenticated user's information
func (h *AuthHandler) Me(c echo.Context) error {
	// The user ID should be set in the context by our JWT middleware
	userID := c.Get("user_id").(int)

	var id int
	var fullName, email, role string
	err := h.DB.QueryRow("SELECT id, full_name, email, role FROM users WHERE id = $1", userID).
		Scan(&id, &fullName, &email, &role)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":        id,
		"full_name": fullName,
		"email":     email,
		"role":      role,
	})
}
