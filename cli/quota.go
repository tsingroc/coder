package cli

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/coder/coder/v2/cli/cliui"
	"github.com/coder/coder/v2/codersdk"
	"github.com/coder/serpent"
)

// namedUser resolves a username or "me" to a user. It also accepts a user ID
// (UUID) directly.
func namedUser(ctx context.Context, client *codersdk.Client, identifier string) (*codersdk.User, error) {
	if identifier == "me" {
		user, err := client.User(ctx, codersdk.Me)
		if err != nil {
			return nil, fmt.Errorf("get current user: %w", err)
		}
		return &user, nil
	}

	// Try as a user ID first (UUID).
	_, err := uuid.Parse(identifier)
	if err == nil {
		user, err := client.User(ctx, identifier)
		if err != nil {
			return nil, fmt.Errorf("get user %q: %w", identifier, err)
		}
		return &user, nil
	}

	// Resolve by username.
	resp, err := client.Users(ctx, codersdk.UsersRequest{Search: identifier})
	if err != nil {
		return nil, fmt.Errorf("search user %q: %w", identifier, err)
	}
	if len(resp.Users) == 0 {
		return nil, fmt.Errorf("user %q not found", identifier)
	}
	return &resp.Users[0], nil
}

// nolint
func (r *RootCmd) quota() *serpent.Command {
	cmd := &serpent.Command{
		Annotations: workspaceCommand,
		Use:         "quota",
		Short:       "Manage workspace quotas",
		Long:        "Manage user and template workspace quotas.",
		Aliases:     []string{"quotas"},
		Children: []*serpent.Command{
			r.getUserQuotas(),
			r.setUserQuota(),
			r.resetUserQuota(),
			r.getTemplateDefaults(),
			r.setTemplateDefault(),
		},
	}

	return cmd
}

// nolint
func (r *RootCmd) getUserQuotas() *serpent.Command {
	return &serpent.Command{
		Annotations: workspaceCommand,
		Use:         "get <username|user-id>",
		Short:       "Get user template quotas",
		Long: FormatExamples(
			Example{
				Description: "Get your own template quotas",
				Command:     "coder quota get me",
			},
			Example{
				Description: "Get another user's quotas (requires admin)",
				Command:     "coder quota get alice",
			},
		),
		Middleware: serpent.Chain(
			serpent.RequireNArgs(1),
		),
		Handler: func(inv *serpent.Invocation) error {
			client, err := r.InitClient(inv)
			if err != nil {
				return err
			}

			user, err := namedUser(inv.Context(), client, inv.Args[0])
			if err != nil {
				return err
			}

			quotas, err := client.GetUserTemplateQuotas(inv.Context(), user.ID.String())
			if err != nil {
				return err
			}

			cliui.Infof(inv.Stdout, "User: %s (%s)\n\n", user.Username, user.ID)
			if len(quotas.Quotas) == 0 {
				cliui.Infof(inv.Stdout, "No quotas found.\n")
				return nil
			}

			for _, q := range quotas.Quotas {
				cliui.Infof(inv.Stdout, "Template: %s\n", q.TemplateID)
				cliui.Infof(inv.Stdout, "  Quota: %d workspaces\n", q.Quota)
				cliui.Infof(inv.Stdout, "  Default: %d workspaces\n", q.DefaultQuota)
				cliui.Infof(inv.Stdout, "  Current: %d workspaces\n", q.CurrentWorkspaces)
				cliui.Infof(inv.Stdout, "  Custom: %t\n\n", q.IsCustom)
			}

			return nil
		},
	}
}

// nolint
func (r *RootCmd) setUserQuota() *serpent.Command {
	var (
		templateID string
		quota      int64
	)

	cmd := &serpent.Command{
		Annotations: workspaceCommand,
		Use:         "set <username|user-id>",
		Short:       "Set user template quota",
		Long: FormatExamples(
			Example{
				Description: "Set quota for a user on a template",
				Command:     "coder quota set alice --template-id <id> --quota 5",
			},
		),
		Middleware: serpent.Chain(
			serpent.RequireNArgs(1),
		),
		Handler: func(inv *serpent.Invocation) error {
			client, err := r.InitClient(inv)
			if err != nil {
				return err
			}

			if templateID == "" {
				return fmt.Errorf("--template-id is required")
			}

			user, err := namedUser(inv.Context(), client, inv.Args[0])
			if err != nil {
				return err
			}

			if quota <= 0 {
				return fmt.Errorf("quota must be greater than 0")
			}

			updated, err := client.SetUserTemplateQuota(
				inv.Context(),
				user.ID.String(),
				templateID,
				codersdk.SetUserTemplateQuotaRequest{
					WorkspaceQuota: quota,
				},
			)
			if err != nil {
				return err
			}

			cliui.Infof(inv.Stdout, "Updated quota for user %s, template %s: %d workspaces\n",
				user.Username, templateID, updated.WorkspaceQuota)
			cliui.Infof(inv.Stdout, "Current workspaces: %d\n", updated.CurrentWorkspaces)
			return nil
		},
	}
	cmd.Options = serpent.OptionSet{
		{
			Flag:        "template-id",
			Required:    true,
			Description: "Template ID to set quota for",
			Value:       serpent.StringOf(&templateID),
		},
		{
			Flag:        "quota",
			Required:    true,
			Description: "Workspace quota (must be > 0)",
			Value:       serpent.Int64Of(&quota),
		},
	}
	return cmd
}

// nolint
func (r *RootCmd) resetUserQuota() *serpent.Command {
	var templateID string

	cmd := &serpent.Command{
		Annotations: workspaceCommand,
		Use:         "reset <username|user-id>",
		Short:       "Reset user template quota",
		Long: FormatExamples(
			Example{
				Description: "Reset user's quota to default",
				Command:     "coder quota reset alice --template-id <id>",
			},
		),
		Middleware: serpent.Chain(
			serpent.RequireNArgs(1),
		),
		Handler: func(inv *serpent.Invocation) error {
			client, err := r.InitClient(inv)
			if err != nil {
				return err
			}

			if templateID == "" {
				return fmt.Errorf("--template-id is required")
			}

			user, err := namedUser(inv.Context(), client, inv.Args[0])
			if err != nil {
				return err
			}

			err = client.ResetUserTemplateQuota(inv.Context(), user.ID.String(), templateID)
			if err != nil {
				return err
			}

			cliui.Infof(inv.Stdout, "Reset quota for user %s, template %s to default\n",
				user.Username, templateID)
			return nil
		},
	}
	cmd.Options = serpent.OptionSet{
		{
			Flag:        "template-id",
			Required:    true,
			Description: "Template ID to reset quota for",
			Value:       serpent.StringOf(&templateID),
		},
	}
	return cmd
}

// nolint
func (r *RootCmd) getTemplateDefaults() *serpent.Command {
	return &serpent.Command{
		Annotations: workspaceCommand,
		Use:         "get-defaults",
		Short:       "Get all template quota defaults",
		Long: FormatExamples(
			Example{
				Description: "List all template default quotas",
				Command:     "coder quota get-defaults",
			},
		),
		Handler: func(inv *serpent.Invocation) error {
			client, err := r.InitClient(inv)
			if err != nil {
				return err
			}

			quotas, err := client.GetAllTemplateQuotaDefaults(inv.Context())
			if err != nil {
				return err
			}

			cliui.Infof(inv.Stdout, "Template Quota Defaults:\n\n")
			if len(quotas) == 0 {
				cliui.Infof(inv.Stdout, "No quota defaults found.\n")
				return nil
			}

			for _, q := range quotas {
				name := q.TemplateDisplayName
				if name == "" {
					name = q.TemplateName
				}
				cliui.Infof(inv.Stdout, "%s (%s):\n", name, q.TemplateID)
				cliui.Infof(inv.Stdout, "  Default Quota: %d workspaces\n", q.DefaultQuota)
				cliui.Infof(inv.Stdout, "  Updated At: %s\n\n", q.UpdatedAt.Format("2006-01-02 15:04:05"))
			}

			return nil
		},
	}
}

// nolint
func (r *RootCmd) setTemplateDefault() *serpent.Command {
	var quota int64

	cmd := &serpent.Command{
		Annotations: workspaceCommand,
		Use:         "set-default <template-id>",
		Short:       "Set template quota default",
		Long: FormatExamples(
			Example{
				Description: "Set default quota for a template",
				Command:     "coder quota set-default <template-id> --quota 15",
			},
		),
		Middleware: serpent.Chain(
			serpent.RequireNArgs(1),
		),
		Handler: func(inv *serpent.Invocation) error {
			client, err := r.InitClient(inv)
			if err != nil {
				return err
			}

			templateID := inv.Args[0]

			if quota <= 0 {
				return fmt.Errorf("quota must be greater than 0")
			}

			updated, err := client.SetTemplateQuotaDefault(
				inv.Context(),
				templateID,
				codersdk.SetTemplateQuotaDefaultRequest{
					DefaultQuota: quota,
				},
			)
			if err != nil {
				return err
			}

			cliui.Infof(inv.Stdout, "Updated default quota for template %s: %d workspaces\n",
				templateID, updated.DefaultQuota)
			return nil
		},
	}
	cmd.Options = serpent.OptionSet{
		{
			Flag:        "quota",
			Required:    true,
			Description: "Default quota (must be > 0)",
			Value:       serpent.Int64Of(&quota),
		},
	}
	return cmd
}
