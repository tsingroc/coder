package coderd

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"golang.org/x/xerrors"

	"cdr.dev/slog/v3"
	"github.com/coder/coder/v2/coderd/httpapi"
	"github.com/coder/coder/v2/codersdk"
)

// ErrUserWorkspaceQuotaExceeded is returned when a user exceeds their
// workspace quota for a specific template.
var ErrUserWorkspaceQuotaExceeded = xerrors.New("user workspace quota exceeded")

// CheckUserWorkspaceQuota checks if a user can create another workspace
// using the specified template based on their quota.
// Returns ErrUserWorkspaceQuotaExceeded if the quota is exceeded.
//
// Note: There is a TOCTOU race between this check and the actual workspace
// creation. Two concurrent requests could both pass the quota check before
// either workspace is committed. This is acceptable for the typical case
// where quota limits are low and concurrent creation by the same user for
// the same template is rare. A production-hardening pass should move this
// check into the workspace creation transaction using a
// SELECT ... FOR UPDATE or advisory lock pattern.
func (api *API) CheckUserWorkspaceQuota(ctx context.Context, userID string, templateID string) error {
	// Get the count of existing workspaces for this user-template combination
	workspaceCount, err := api.getUserWorkspaceCountByTemplate(ctx, userID, templateID)
	if err != nil {
		return xerrors.Errorf("get user workspace count by template: %w", err)
	}

	// Get the user's quota for this template
	quota, err := api.getUserTemplateQuota(ctx, userID, templateID)
	if err != nil {
		return xerrors.Errorf("get user template quota: %w", err)
	}

	api.Logger.Warn(ctx, "QUOTA CHECK",
		slog.F("user_id", userID),
		slog.F("template_id", templateID),
		slog.F("workspace_count", workspaceCount),
		slog.F("quota", quota),
	)

	// Check if quota is exceeded
	if int64(workspaceCount) >= quota {
		return &QuotaExceededError{
			UserID:       userID,
			TemplateID:   templateID,
			CurrentCount: int64(workspaceCount),
			Quota:        quota,
		}
	}

	return nil
}

// getUserTemplateQuota retrieves the user's quota for a specific template.
// It first checks for a custom user quota, then falls back to the
// global default quota for the template.
func (api *API) getUserTemplateQuota(ctx context.Context, userID string, templateID string) (int64, error) {
	// Try to get user's custom quota first
	quota, err := api.getUserCustomQuota(ctx, userID, templateID)
	if err == nil {
		return quota, nil
	}

	// If no custom quota, get the default quota for the template
	if xerrors.Is(err, sql.ErrNoRows) {
		defaultQuota, err := api.getTemplateDefaultQuota(ctx, templateID)
		if err != nil {
			// If template has no default quota set, use a fallback value
			if xerrors.Is(err, sql.ErrNoRows) {
				return 10, nil // Default fallback quota
			}
			return 0, xerrors.Errorf("get template quota default: %w", err)
		}
		return defaultQuota, nil
	}

	return 0, err
}

// getUserCustomQuota retrieves a user's custom quota for a specific template.
func (api *API) getUserCustomQuota(ctx context.Context, userID string, templateID string) (int64, error) {
	return api.Database.GetUserCustomQuota(ctx, userID, templateID)
}

// getTemplateDefaultQuota retrieves the default quota for a template.
func (api *API) getTemplateDefaultQuota(ctx context.Context, templateID string) (int64, error) {
	return api.Database.GetTemplateDefaultQuota(ctx, templateID)
}

// getUserWorkspaceCountByTemplate counts how many workspaces a user has
// created using a specific template.
func (api *API) getUserWorkspaceCountByTemplate(ctx context.Context, userID string, templateID string) (int64, error) {
	return api.Database.GetUserWorkspaceCountByTemplate(ctx, userID, templateID)
}

// QuotaExceededError is returned when a user attempts to create a workspace
// but has exceeded their quota for that template.
type QuotaExceededError struct {
	UserID       string
	TemplateID   string
	CurrentCount int64
	Quota        int64
}

func (e *QuotaExceededError) Error() string {
	return fmt.Sprintf("user %s has exceeded workspace quota for template %s: %d/%d",
		e.UserID, e.TemplateID, e.CurrentCount, e.Quota)
}

// HTTPStatus returns the HTTP status code for this error.
func (e *QuotaExceededError) HTTPStatus() int {
	return http.StatusForbidden
}

// WriteHTTPError writes the error as an HTTP response.
func (e *QuotaExceededError) WriteHTTPError(ctx context.Context, rw http.ResponseWriter) {
	httpapi.Write(ctx, rw, e.HTTPStatus(), codersdk.Response{
		Message: fmt.Sprintf(
			"You have reached your workspace quota limit (%d/%d) for this template. "+
				"Please contact an administrator to increase your quota.",
			e.CurrentCount, e.Quota,
		),
	})
}
