package rbac

// ResourceUserWorkspaceQuota represents user workspace quota resources.
// Valid Actions:
//   - "ActionRead" :: view user's template quotas
//   - "ActionCreate" :: set user's template quota
//   - "ActionDelete" :: reset user's template quota to default
var ResourceUserWorkspaceQuota = Object{
	Type: "user_workspace_quota",
}

// ResourceQuota represents system-wide quota resources.
// Valid Actions:
//   - "ActionRead" :: view template quota defaults
//   - "ActionCreate" :: set template quota default
var ResourceQuota = Object{
	Type: "quota",
}
