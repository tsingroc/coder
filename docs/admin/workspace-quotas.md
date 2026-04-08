# Workspace Quotas

Workspace quotas allow administrators to control the number of workspaces users can create per template. This helps manage resource consumption and ensure fair allocation across your organization.

## Overview

Workspace quotas limit the number of active workspaces a user can create from a specific template. For example, you can set a quota of 5 workspaces per user for a "Development Environment" template, ensuring each user can create up to 5 development workspaces.

**Key features:**

- **Per-template quotas**: Set different limits for different templates
- **User-specific overrides**: Grant higher or lower limits to specific users
- **Template defaults**: Configure default quotas that apply to all users
- **Automatic enforcement**: Workspace creation is automatically blocked when quota is exceeded
- **Usage tracking**: View current workspace count alongside quota limits

## Quota Hierarchy

When determining a user's workspace quota for a template, Coder uses the following hierarchy:

1. **User-specific quota**: If a custom quota is set for the user, this takes precedence
2. **Template default**: If no user-specific quota exists, the template default is used
3. **Built-in fallback**: If neither is set, a default of 10 workspaces per template applies

## Setting Template Quota Defaults

Administrators can set default workspace quotas for templates that apply to all users unless overridden.

### Via UI

1. Navigate to **Deployment Settings** > **Workspace Quotas**
2. Find the template you want to configure
3. Click **Edit**
4. Enter the default quota (number of workspaces)
5. Click **Save**

### Via CLI

```bash
# Set default quota for a template
coder quota set-default <template-id> --quota 10

# List all template defaults
coder quota get-defaults
```

## Managing User-Specific Quotas

Administrators can override template defaults for specific users.

### Via CLI

```bash
# Set custom quota for a user
coder quota set <username-or-id> --template-id <template-id> --quota 15

# View user's quotas (including defaults and custom)
coder quota get <username-or-id>

# Reset user's quota to template default
coder quota reset <username-or-id> --template-id <template-id>
```

## Viewing User Quotas

Users can view their own quota status, and administrators can view quotas for any user.

### Via CLI

```bash
# View your own quotas
coder quota get me

# View another user's quotas (requires admin)
coder quota get <username>
```

### Via API

```bash
# Get user template quotas
curl -H "Coder-Session-Token: $TOKEN" \
  https://coder.example.com/api/v2/users/$USER_ID/quotas/templates
```

## Quota Enforcement

Quotas are enforced when users attempt to create workspaces:

- **Within quota**: Workspace creation proceeds normally
- **At quota limit**: Workspace creation is blocked with an error message
- **Above quota**: Cannot happen (creation is blocked at the limit)

The quota check considers:
- **Active workspaces**: Workspaces that are running or stopped
- **Pending workspaces**: Workspaces currently being built
- **Template-specific**: Count is per-template, not across all templates

### Error Message

When a user exceeds their quota, they see:

> You have reached your workspace quota for this template (X/Y workspaces).
> Delete existing workspaces or contact your administrator to increase your quota.

## Permissions

The following permissions control quota management:

| Permission                    | Description                       |
|-------------------------------|-----------------------------------|
| `template:update`             | Set template quota defaults       |
| `user:update-workspace-quota` | Set or reset user-specific quotas |
| `user:read-workspace-quota`   | View user quotas (own or others)  |

By default, these permissions are granted to:
- **Template Admin**: Can set template defaults
- **User Admin**: Can manage user-specific quotas
- **All users**: Can view their own quotas

## Use Cases

### Cost Control

Limit resource consumption by capping the number of workspaces per user:

```bash
# Set conservative defaults for expensive templates
coder quota set-default gpu-template-id --quota 2
coder quota set-default standard-template-id --quota 10
```

### Fair Allocation

Ensure equitable resource distribution across teams:

```bash
# Grant higher quotas to specific teams or users
coder quota set senior-dev --template-id prod-template --quota 20
coder quota set junior-dev --template-id prod-template --quota 5
```

### Onboarding Tiers

Implement graduated access based on user seniority:

```bash
# New users start with low quotas
coder quota set new-user --template-id dev-template --quota 3

# Increase quota as users gain experience
coder quota set experienced-user --template-id dev-template --quota 15
```

## Troubleshooting

### Users cannot create workspaces

1. **Check quota status**: Run `coder quota get <username>` to see current usage
2. **Verify limits**: Ensure the quota allows for more workspaces
3. **Review workspace count**: Check for deleted workspaces that might still count
4. **Increase quota**: If needed, set a higher quota for the user or template

### Quota not applying

1. **Verify template ID**: Ensure you're setting quotas for the correct template
2. **Check user-specific quota**: User-specific quotas override template defaults
3. **Review permissions**: Ensure you have permission to manage quotas
4. **Check for cached data**: The UI may take a moment to reflect changes

### Cannot set quotas

1. **Verify permissions**: Ensure you have `template:update` or `user:update-workspace-quota`
2. **Check template ID**: Use the template UUID, not the name
3. **Positive values**: Quotas must be greater than 0

## API Reference

### Endpoints

| Endpoint                                           | Method | Description                      |
|----------------------------------------------------|--------|----------------------------------|
| `/api/v2/quotas/templates`                         | GET    | List all template quota defaults |
| `/api/v2/quotas/templates/{template}`              | PUT    | Set template quota default       |
| `/api/v2/users/{user}/quotas/templates`            | GET    | Get user template quotas         |
| `/api/v2/users/{user}/quotas/templates/{template}` | PUT    | Set user template quota          |
| `/api/v2/users/{user}/quotas/templates/{template}` | DELETE | Reset user quota to default      |

### Example API Usage

```bash
# Set template default
curl -X PUT https://coder.example.com/api/v2/quotas/templates/$TEMPLATE_ID \
  -H "Coder-Session-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"default_quota": 10}'

# Get user quotas
curl -X GET https://coder.example.com/api/v2/users/$USER_ID/quotas/templates \
  -H "Coder-Session-Token: $TOKEN"

# Set user quota
curl -X PUT https://coder.example.com/api/v2/users/$USER_ID/quotas/templates/$TEMPLATE_ID \
  -H "Coder-Session-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workspace_quota": 15}'

# Reset user quota
curl -X DELETE https://coder.example.com/api/v2/users/$USER_ID/quotas/templates/$TEMPLATE_ID \
  -H "Coder-Session-Token: $TOKEN"
```

## Related Documentation

- [Template Management](./templates.md)
- [User Management](./users.md)
- [RBAC and Permissions](./groups-roles.md)
- [CLI Reference](../../reference/cli/index.md)
