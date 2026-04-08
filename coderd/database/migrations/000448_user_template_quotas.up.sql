-- User-Template Quotas: Allow per-user, per-template workspace quotas
-- This enables fine-grained control over how many workspaces a user can create
-- using a specific template, with both global defaults and user-specific overrides.

-- User-template quota table (user custom quotas)
-- Stores custom quotas for specific user-template combinations
CREATE TABLE user_template_quotas (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    workspace_quota INTEGER NOT NULL CHECK (workspace_quota > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, template_id)
);

-- Template quota defaults table (global default quotas)
-- Stores default quotas for each template that apply to all users
-- unless they have a custom quota override
CREATE TABLE template_quota_defaults (
    template_id UUID PRIMARY KEY REFERENCES templates(id) ON DELETE CASCADE,
    default_quota INTEGER NOT NULL CHECK (default_quota > 0),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Set default quota of 10 for all existing templates
INSERT INTO template_quota_defaults (template_id, default_quota, updated_at)
SELECT id, 10, NOW() FROM templates;
