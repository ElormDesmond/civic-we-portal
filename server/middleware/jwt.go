package middleware

import (
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// Claims defines the JWT payload structure (duplicated from handlers for simplicity, 
// ideally moved to a shared 'models' or 'types' package later)
type Claims struct {
	UserID int    `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

var jwtSecret = []byte("development-secret-key") // MUST match the one in handlers/auth.go

// JWTMiddleware extracts the JWT from the cookie and validates it
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie("auth_token")
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing or invalid token"})
		}

		tokenString := cookie.Value
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid or expired token"})
		}

		// Store user ID and role in context for handlers to use
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)

		return next(c)
	}
}

// AdminMiddleware ensures the authenticated user has the 'admin' role
func AdminMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		role := c.Get("role").(string)
		if role != "admin" {
			return c.JSON(http.StatusForbidden, map[string]string{"error": "Insufficient permissions"})
		}
		return next(c)
	}
}
