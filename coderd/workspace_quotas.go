package coderd

import (
	"context"
	"database/sql"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"golang.org/x/xerrors"

	"github.com/coder/coder/v2/coderd/database"
	"github.com/coder/coder/v2/coderd/httpapi"
	"github.com/coder/coder/v2/coderd/httpmw"
	"github.com/coder/coder/v2/coderd/rbac"
	"github.com/coder/coder/v2/coderd/rbac/policy"
	"github.com/coder/coder/v2/codersdk"
)

// (getUserTemplateQuotas) gets all template quotas for a user.
// @Summary Get user template quotas
// @ID get-user-template-quotas
// @Security CoderSessionToken
// @Produce json
// @Tags UserQuotas
// @Param user path string true "User ID, username, or me"
// @Success 200 {object} codersdk.UserTemplateQuotasResponse
// @Router /users/{user}/quotas/templates [get]
func (api *API) getUserTemplateQuotas(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx  = r.Context()
		user = httpmw.UserParam(r)
	)

	// Check permissions: admin or user themselves
	if !api.Authorize(r, policy.ActionRead, rbac.ResourceUserWorkspaceQuota.WithID(user.ID)) {
		httpapi.Forbidden(rw)
		return
	}

	// Build response by combining user quotas, defaults, and usage
	response := codersdk.UserTemplateQuotasResponse{
		UserID: user.ID.String(),
		Quotas: []codersdk.TemplateQuotaInfo{},
	}

	// Get user's custom quotas
	userQuotas, err := api.getAllUserTemplateQuotasDB(ctx, user.ID.String())
	if err != nil && !xerrors.Is(err, sql.ErrNoRows) {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Failed to get user quotas",
			Detail:  err.Error(),
		})
		return
	}

	// Get template usage for this user
	usage, err := api.getTemplateUsageByUserDB(ctx, user.ID.String())
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Failed to get template usage",
			Detail:  err.Error(),
		})
		return
	}

	// Get all template defaults
	defaultQuotas, err := api.getAllTemplateQuotaDefaultsDB(ctx)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Failed to get default quotas",
			Detail:  err.Error(),
		})
		return
	}

	// Build maps for easy lookup
	quotaMap := make(map[string]int64)
	for _, q := range userQuotas {
		quotaMap[q.TemplateID.String()] = q.WorkspaceQuota
	}

	defaultQuotaMap := make(map[string]int64)
	for _, q := range defaultQuotas {
		defaultQuotaMap[q.TemplateID.String()] = q.DefaultQuota
	}

	usageMap := make(map[string]int64)
	for _, u := range usage {
		usageMap[u.TemplateID.String()] = int64(u.WorkspaceCount)
	}

	// Collect all template IDs involved
	allTemplateIDs := make(map[string]bool)
	for tid := range quotaMap {
		allTemplateIDs[tid] = true
	}
	for tid := range defaultQuotaMap {
		allTemplateIDs[tid] = true
	}
	for tid := range usageMap {
		allTemplateIDs[tid] = true
	}

	// Build quota info list
	for tid := range allTemplateIDs {
		quota := quotaMap[tid]
		defaultQuota := defaultQuotaMap[tid]
		current := usageMap[tid]

		info := codersdk.TemplateQuotaInfo{
			TemplateID:        tid,
			Quota:             quota,
			DefaultQuota:      defaultQuota,
			CurrentWorkspaces: current,
			IsCustom:          quotaMap[tid] > 0,
		}

		response.Quotas = append(response.Quotas, info)
	}

	httpapi.Write(ctx, rw, http.StatusOK, response)
}

// (setUserTemplateQuota) sets a user's quota for a specific template.
// @Summary Set user template quota
// @ID set-user-template-quota
// @Security CoderSessionToken
// @Accept json
// @Produce json
// @Tags UserQuotas
// @Param user path string true "User ID, username, or me"
// @Param template path string true "Template ID"
// @Param request body codersdk.SetUserTemplateQuotaRequest true "Set quota request"
// @Success 200 {object} codersdk.UserTemplateQuota
// @Router /users/{user}/quotas/templates/{template} [put]
func (api *API) setUserTemplateQuota(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx        = r.Context()
		apiKey     = httpmw.APIKey(r)
		user       = httpmw.UserParam(r)
		templateID = chi.URLParam(r, "template")
	)

	// Check permissions: only admin can set quotas
	if !api.Authorize(r, policy.ActionCreate, rbac.ResourceUserWorkspaceQuota.WithID(user.ID)) {
		httpapi.Forbidden(rw)
		return
	}

	var req codersdk.SetUserTemplateQuotaRequest
	if !httpapi.Read(ctx, rw, r, &req) {
		return
	}

	// Validate quota value
	if req.WorkspaceQuota <= 0 {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "Workspace quota must be greater than 0",
		})
		return
	}

	// Set user quota
	userQuota, err := api.setUserTemplateQuotaDB(ctx, user.ID.String(), templateID, req.WorkspaceQuota, apiKey.UserID)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Failed to set user quota",
			Detail:  err.Error(),
		})
		return
	}

	// Get current workspace count
	workspaceCount, _ := api.getUserWorkspaceCountByTemplate(ctx, user.ID.String(), templateID)

	httpapi.Write(ctx, rw, http.StatusOK, codersdk.UserTemplateQuota{
		UserID:            userQuota.UserID.String(),
		TemplateID:        userQuota.TemplateID.String(),
		WorkspaceQuota:    userQuota.WorkspaceQuota,
		CurrentWorkspaces: int64(workspaceCount),
		CreatedAt:         userQuota.CreatedAt,
		UpdatedAt:         userQuota.UpdatedAt,
	})
}

// (resetUserTemplateQuota) resets a user's quota for a specific template to default.
// @Summary Reset user template quota to default
// @ID reset-user-template-quota
// @Security CoderSessionToken
// @Tags UserQuotas
// @Param user path string true "User ID, username, or me"
// @Param template path string true "Template ID"
// @Success 204
// @Router /users/{user}/quotas/templates/{template} [delete]
func (api *API) resetUserTemplateQuota(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx        = r.Context()
		user       = httpmw.UserParam(r)
		templateID = chi.URLParam(r, "template")
	)

	// Check permissions: only admin can reset quotas
	if !api.Authorize(r, policy.ActionDelete, rbac.ResourceUserWorkspaceQuota.WithID(user.ID)) {
		httpapi.Forbidden(rw)
		return
	}

	// Delete user custom quota (reverts to default)
	err := api.deleteUserTemplateQuotaDB(ctx, user.ID.String(), templateID)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Failed to reset user quota",
			Detail:  err.Error(),
		})
		return
	}

	rw.WriteHeader(http.StatusNoContent)
}

// (getAllTemplateQuotaDefaults) gets all template default quotas.
// @Summary Get all template quota defaults
// @ID get-all-template-quota-defaults
// @Security CoderSessionToken
// @Produce json
// @Tags TemplateQuotas
// @Success 200 {object} []codersdk.TemplateQuotaDefault
// @Router /quotas/templates [get]
func (api *API) getAllTemplateQuotaDefaults(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check permissions: admin only
	if !api.Authorize(r, policy.ActionRead, rbac.ResourceQuota) {
		httpapi.Forbidden(rw)
		return
	}

	quotas, err := api.getAllTemplateQuotaDefaultsDB(ctx)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Failed to get template quota defaults",
			Detail:  err.Error(),
		})
		return
	}

	response := make([]codersdk.TemplateQuotaDefault, 0, len(quotas))
	for _, q := range quotas {
		response = append(response, codersdk.TemplateQuotaDefault{
			TemplateID:          q.TemplateID.String(),
			TemplateName:        q.TemplateName,
			TemplateDisplayName: q.TemplateDisplayName,
			TemplateIcon:        q.TemplateIcon,
			DefaultQuota:        q.DefaultQuota,
			UpdatedAt:           q.UpdatedAt,
		})
	}

	httpapi.Write(ctx, rw, http.StatusOK, response)
}

// (setTemplateQuotaDefault) sets the default quota for a template.
// @Summary Set template quota default
// @ID set-template-quota-default
// @Security CoderSessionToken
// @Accept json
// @Produce json
// @Tags TemplateQuotas
// @Param template path string true "Template ID"
// @Param request body codersdk.SetTemplateQuotaDefaultRequest true "Set default quota request"
// @Success 200 {object} codersdk.TemplateQuotaDefault
// @Router /quotas/templates/{template} [put]
func (api *API) setTemplateQuotaDefault(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx        = r.Context()
		apiKey     = httpmw.APIKey(r)
		templateID = chi.URLParam(r, "template")
	)

	// Check permissions: admin only
	if !api.Authorize(r, policy.ActionCreate, rbac.ResourceQuota) {
		httpapi.Forbidden(rw)
		return
	}

	var req codersdk.SetTemplateQuotaDefaultRequest
	if !httpapi.Read(ctx, rw, r, &req) {
		return
	}

	// Validate quota value
	if req.DefaultQuota <= 0 {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "Default quota must be greater than 0",
		})
		return
	}

	// Set default quota
	defaultQuota, err := api.setTemplateQuotaDefaultDB(ctx, templateID, req.DefaultQuota, apiKey.UserID)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Failed to set default quota",
			Detail:  err.Error(),
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, codersdk.TemplateQuotaDefault{
		TemplateID:   defaultQuota.TemplateID.String(),
		DefaultQuota: defaultQuota.DefaultQuota,
		UpdatedAt:    defaultQuota.UpdatedAt,
	})
}

// Database helper methods below

// getAllUserTemplateQuotasDB retrieves all custom quotas for a user.
func (api *API) getAllUserTemplateQuotasDB(ctx context.Context, userID string) ([]database.UserTemplateQuotaRow, error) {
	return api.Database.GetAllUserTemplateQuotas(ctx, userID)
}

// getTemplateUsageByUserDB retrieves workspace usage breakdown by template for a user.
func (api *API) getTemplateUsageByUserDB(ctx context.Context, userID string) ([]database.TemplateUsageByUserRow, error) {
	return api.Database.GetTemplateUsageByUser(ctx, userID)
}

// getAllTemplateQuotaDefaultsDB retrieves all template default quotas.
func (api *API) getAllTemplateQuotaDefaultsDB(ctx context.Context) ([]database.TemplateQuotaDefaultRow, error) {
	return api.Database.GetAllTemplateQuotaDefaults(ctx)
}

// setUserTemplateQuotaDB sets or updates a user's quota for a template.
func (api *API) setUserTemplateQuotaDB(ctx context.Context, userID, templateID string, quota int64, updatedBy uuid.UUID) (database.UserTemplateQuotaRow, error) {
	return api.Database.SetUserTemplateQuota(ctx, userID, templateID, quota, updatedBy)
}

// deleteUserTemplateQuotaDB deletes a user's custom quota for a template.
func (api *API) deleteUserTemplateQuotaDB(ctx context.Context, userID, templateID string) error {
	return api.Database.DeleteUserTemplateQuota(ctx, userID, templateID)
}

// setTemplateQuotaDefaultDB sets or updates the default quota for a template.
func (api *API) setTemplateQuotaDefaultDB(ctx context.Context, templateID string, quota int64, updatedBy uuid.UUID) (database.TemplateQuotaDefaultRow, error) {
	return api.Database.SetTemplateQuotaDefault(ctx, templateID, quota, updatedBy)
}
