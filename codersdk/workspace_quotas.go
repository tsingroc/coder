package codersdk

import "time"

// UserTemplateQuotasResponse represents a user's template quotas response.
type UserTemplateQuotasResponse struct {
	UserID string              `json:"user_id"`
	Quotas []TemplateQuotaInfo `json:"quotas"`
}

// TemplateQuotaInfo represents quota information for a specific template.
type TemplateQuotaInfo struct {
	TemplateID        string `json:"template_id"`
	Quota             int64  `json:"quota"`
	DefaultQuota      int64  `json:"default_quota"`
	CurrentWorkspaces int64  `json:"current_workspaces"`
	IsCustom          bool   `json:"is_custom"`
}

// UserTemplateQuota represents a user's quota for a specific template.
type UserTemplateQuota struct {
	UserID            string    `json:"user_id"`
	TemplateID        string    `json:"template_id"`
	WorkspaceQuota    int64     `json:"workspace_quota"`
	CurrentWorkspaces int64     `json:"current_workspaces"`
	CreatedAt         time.Time `json:"created_at,omitempty"`
	UpdatedAt         time.Time `json:"updated_at,omitempty"`
}

// SetUserTemplateQuotaRequest represents a request to set a user's template quota.
type SetUserTemplateQuotaRequest struct {
	WorkspaceQuota int64 `json:"workspace_quota" validate:"required,min=1"`
}

// TemplateQuotaDefault represents a template's default quota.
type TemplateQuotaDefault struct {
	TemplateID          string    `json:"template_id"`
	TemplateName        string    `json:"template_name,omitempty"`
	TemplateDisplayName string    `json:"template_display_name,omitempty"`
	TemplateIcon        string    `json:"template_icon,omitempty"`
	DefaultQuota        int64     `json:"default_quota"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// SetTemplateQuotaDefaultRequest represents a request to set a template's default quota.
type SetTemplateQuotaDefaultRequest struct {
	DefaultQuota int64 `json:"default_quota" validate:"required,min=1"`
}

// UserQuotaOverride represents a single user's custom quota override for a
// template, including user and template display information.
type UserQuotaOverride struct {
	UserID              string    `json:"user_id"`
	Username            string    `json:"username"`
	Email               string    `json:"email,omitempty"`
	AvatarURL           string    `json:"avatar_url,omitempty"`
	TemplateID          string    `json:"template_id"`
	TemplateName        string    `json:"template_name"`
	TemplateDisplayName string    `json:"template_display_name,omitempty"`
	TemplateIcon        string    `json:"template_icon,omitempty"`
	WorkspaceQuota      int64     `json:"workspace_quota"`
	UpdatedAt           time.Time `json:"updated_at"`
}
