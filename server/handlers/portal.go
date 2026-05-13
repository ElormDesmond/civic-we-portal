package handlers

import (
	"database/sql"
	"net/http"

	"github.com/labstack/echo/v4"
)

type PortalHandler struct {
	DB *sql.DB
}

// DepartmentWithOfficials represents a department and its associated officials
type DepartmentWithOfficials struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Icon        string     `json:"icon"`
	Officials   []Official `json:"officials"`
}

type Official struct {
	ID           int    `json:"id"`
	FullName     string `json:"full_name"`
	Role         string `json:"role"`
	Bio          string `json:"bio"`
	ImageURL     string `json:"image_url"`
	DepartmentID int    `json:"department_id"`
}

type NewsArticle struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Content     string `json:"content"`
	Author      string `json:"author"`
	ImageURL    string `json:"image_url"`
	PublishedAt string `json:"published_at"`
}

type Project struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Status      string  `json:"status"`
	Budget      float64 `json:"budget"`
	EndDate     string  `json:"end_date"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
}

// GetDepartments returns all departments with their officials nested
func (h *PortalHandler) GetDepartments(c echo.Context) error {
	rows, err := h.DB.Query("SELECT id, name, description, icon FROM departments")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch departments"})
	}
	defer rows.Close()

	var depts []DepartmentWithOfficials
	for rows.Next() {
		var d DepartmentWithOfficials
		if err := rows.Scan(&d.ID, &d.Name, &d.Description, &d.Icon); err != nil {
			continue
		}

		// Fetch officials for this department
		offRows, err := h.DB.Query("SELECT id, full_name, role, bio, image_url, department_id FROM officials WHERE department_id = $1", d.ID)
		if err == nil {
			var officials []Official
			for offRows.Next() {
				var o Official
				if err := offRows.Scan(&o.ID, &o.FullName, &o.Role, &o.Bio, &o.ImageURL, &o.DepartmentID); err == nil {
					officials = append(officials, o)
				}
			}
			offRows.Close()
			d.Officials = officials
		}
		
		depts = append(depts, d)
	}

	return c.JSON(http.StatusOK, depts)
}

// GetNews returns all news articles
func (h *PortalHandler) GetNews(c echo.Context) error {
	rows, err := h.DB.Query("SELECT id, title, content, author, image_url, published_at FROM news ORDER BY published_at DESC")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch news"})
	}
	defer rows.Close()

	var articles []NewsArticle
	for rows.Next() {
		var a NewsArticle
		if err := rows.Scan(&a.ID, &a.Title, &a.Content, &a.Author, &a.ImageURL, &a.PublishedAt); err != nil {
			continue
		}
		articles = append(articles, a)
	}

	return c.JSON(http.StatusOK, articles)
}

// CreateNews adds a new article to the database
func (h *PortalHandler) CreateNews(c echo.Context) error {
	type NewsReq struct {
		Title    string `json:"title"`
		Content  string `json:"content"`
		Author   string `json:"author"`
		ImageURL string `json:"image_url"`
	}

	req := new(NewsReq)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	_, err := h.DB.Exec("INSERT INTO news (title, content, author, image_url) VALUES ($1, $2, $3, $4)",
		req.Title, req.Content, req.Author, req.ImageURL)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create news article"})
	}

	return c.JSON(http.StatusCreated, map[string]string{"message": "News article created successfully"})
}

// UpdateNews modifies an existing news article
func (h *PortalHandler) UpdateNews(c echo.Context) error {
	id := c.Param("id")
	type NewsReq struct {
		Title    string `json:"title"`
		Content  string `json:"content"`
		Author   string `json:"author"`
		ImageURL string `json:"image_url"`
	}

	req := new(NewsReq)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	_, err := h.DB.Exec("UPDATE news SET title = $1, content = $2, author = $3, image_url = $4 WHERE id = $5",
		req.Title, req.Content, req.Author, req.ImageURL, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update news article"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "News article updated successfully"})
}

// DeleteNews removes an article from the database
func (h *PortalHandler) DeleteNews(c echo.Context) error {
	id := c.Param("id")
	_, err := h.DB.Exec("DELETE FROM news WHERE id = $1", id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete news article"})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "News article deleted successfully"})
}

// GetProjects returns all municipal projects
func (h *PortalHandler) GetProjects(c echo.Context) error {
	rows, err := h.DB.Query("SELECT id, title, description, status, budget, COALESCE(end_date::text, ''), COALESCE(latitude, 0), COALESCE(longitude, 0) FROM projects ORDER BY created_at DESC")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch projects"})
	}
	defer rows.Close()

	var projects []Project
	for rows.Next() {
		var p Project
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.Status, &p.Budget, &p.EndDate, &p.Latitude, &p.Longitude); err != nil {
			continue
		}
		projects = append(projects, p)
	}

	return c.JSON(http.StatusOK, projects)
}
