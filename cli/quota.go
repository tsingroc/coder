package cli

import (
	"fmt"
	"strconv"

	"github.com/coder/coder/v2/cli/cliui"
	"github.com/coder/coder/v2/codersdk"
	"github.com/coder/serpent"
)

// nolint
func (r *RootCmd) quota() *serpent.Command {
	cmd := &serpent.Command{
		Annotations: workspaceCommand,
		Use:         "quota",
		Short:       "Manage workspace quotas",
		Long:        "Manage user and template workspace quotas.",
		Aliases:     []string{"quotas"},
	}

	cmd.AddCommand(r.getUserQuotas())
	cmd.AddCommand(r.setUserQuota())
	cmd.AddCommand(r.resetUserQuota())
	cmd.AddCommand(r.getTemplateDefaults())
	cmd.AddCommand(r.setTemplateDefault())

	return cmd
}

// nolint
func (r *RootCmd) getUserQuotas() *serpent.Command {
	return &serpent.Command{
		Annotations: workspaceCommand,
		Use:         "get <username|user-id>",
		Short:       "Get user template quotas",
		Long:        "Get all template quotas for a user, including custom quotas and defaults.",
		Example: FormatExamples(
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

			quotas, err := client.GetUserTemplateQuotas(inv.Context(), user.ID)
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
		Long:        "Set a custom quota for a user on a specific template.",
		Example: FormatExamples(
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
				user.ID,
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
			Default:     "",
		},
		{
			Flag:        "quota",
			Required:    true,
			Description: "Workspace quota (must be > 0)",
			Value:       serpent.Int64Quota(&quota),
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
		Long:        "Reset a user's quota for a specific template to the default value.",
		Example: FormatExamples(
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

			err = client.ResetUserTemplateQuota(inv.Context(), user.ID, templateID)
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
			Default:     "",
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
		Long:        "Get default quotas for all templates.",
		Example: FormatExamples(
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
		Long:        "Set the default workspace quota for a template.",
		Example: FormatExamples(
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
			Value:       serpent.Int64Quota(&quota),
		},
	}
	return cmd
}
