package main

import (
	"database/sql"
	"fmt"
	"net/http"

	"civic-portal/server/handlers"
	"civic-portal/server/middleware"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

func main() {
	// We create a new Echo instance here
	e := echo.New()

	// CORS configuration for React frontend
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowCredentials: true,
	}))

	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())

	// We attempt to connect to the Postgres database using environment variables
	dbUser := "user"
	dbPass := "password"
	dbName := "civic_portal"
	dbHost := "localhost"
	dbPort := "5432"

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPass, dbName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		e.Logger.Fatal("Could not open database connection:", err)
	}

	// Initialize our handlers
	authHandler := &handlers.AuthHandler{DB: db}
	portalHandler := &handlers.PortalHandler{DB: db}
	permitHandler := &handlers.PermitHandler{DB: db}
	uploadHandler := &handlers.UploadHandler{}
	searchHandler := &handlers.SearchHandler{DB: db}

	// Static files serving for uploads
	e.Static("/uploads", "uploads")

	// Public Routes
	e.GET("/health", func(c echo.Context) error {
		err := db.Ping()
		if err != nil {
			return c.String(http.StatusInternalServerError, "Backend is UP, but Database is DOWN!")
		}
		return c.String(http.StatusOK, "Backend and Database are healthy and connected!")
	})

	e.POST("/api/register", authHandler.Register)
	e.POST("/api/login", authHandler.Login)
	e.POST("/api/logout", authHandler.Logout)

	// Public Portal Routes
	e.GET("/api/departments", portalHandler.GetDepartments)
	e.GET("/api/news", portalHandler.GetNews)
	e.GET("/api/projects", portalHandler.GetProjects)
	e.GET("/api/search", searchHandler.GlobalSearch)

	// Protected Routes
	api := e.Group("/api")
	api.Use(middleware.JWTMiddleware)
	api.GET("/me", authHandler.Me)
	api.GET("/ws", handlers.GlobalHub.HandleWS)
	api.POST("/permits", permitHandler.SubmitPermit)
	api.GET("/permits/my", permitHandler.GetMyPermits)

	// Admin Routes (RBAC Protected)
	admin := e.Group("/api/admin")
	admin.Use(middleware.JWTMiddleware)
	admin.Use(middleware.AdminMiddleware)
	
	admin.POST("/upload", uploadHandler.HandleUpload)
	admin.GET("/permits", permitHandler.GetAllPermits)
	admin.PUT("/permits/:id/status", permitHandler.UpdatePermitStatus)
	admin.POST("/news", portalHandler.CreateNews)
	admin.PUT("/news/:id", portalHandler.UpdateNews)
	admin.DELETE("/news/:id", portalHandler.DeleteNews)

	e.Logger.Fatal(e.Start(":8888"))
}
