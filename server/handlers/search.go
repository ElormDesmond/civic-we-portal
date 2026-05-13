package handlers

import (
	"database/sql"
	"net/http"

	"github.com/labstack/echo/v4"
)

type SearchHandler struct {
	DB *sql.DB
}

type SearchResult struct {
	ID      int     `json:"id"`
	Type    string  `json:"type"` // 'news' or 'project'
	Title   string  `json:"title"`
	Snippet string  `json:"snippet"`
	Rank    float64 `json:"rank"`
}

// GlobalSearch performs a weighted full-text search across news and projects
func (h *SearchHandler) GlobalSearch(c echo.Context) error {
	query := c.QueryParam("q")
	if query == "" {
		return c.JSON(http.StatusOK, []SearchResult{})
	}

	// We use a UNION to search across both tables and rank the results
	sqlQuery := `
		SELECT id, 'news' as type, title, substring(content from 1 for 150) as snippet, ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as rank
		FROM news
		WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
		UNION ALL
		SELECT id, 'project' as type, title, substring(description from 1 for 150) as snippet, ts_rank(to_tsvector('english', title || ' ' || description), plainto_tsquery('english', $1)) as rank
		FROM projects
		WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', $1)
		ORDER BY rank DESC
		LIMIT 20
	`

	rows, err := h.DB.Query(sqlQuery, query)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Search failed"})
	}
	defer rows.Close()

	var results []SearchResult
	for rows.Next() {
		var r SearchResult
		if err := rows.Scan(&r.ID, &r.Type, &r.Title, &r.Snippet, &r.Rank); err != nil {
			continue
		}
		results = append(results, r)
	}

	return c.JSON(http.StatusOK, results)
}
