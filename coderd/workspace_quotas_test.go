package coderd_test

import (
	"context"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/xerrors"

	"github.com/coder/coder/v2/coderd/coderdtest"
	"github.com/coder/coder/v2/coderd/database"
	"github.com/coder/coder/v2/coderd/rbac"
	"github.com/coder/coder/v2/codersdk"
	"github.com/coder/coder/v2/testutil"
)

func TestUserTemplateQuotas(t *testing.T) {
	t.Parallel()

	t.Run("GetUserTemplateQuotas", func(t *testing.T) {
		t.Parallel()

		client := coderdtest.New(t, &coderdtest.Options{
			IncludeProvisionerDaemon: true,
		})
		user := coderdtest.CreateFirstUser(t, client)

		// Create a template
		version := coderdtest.CreateTemplateVersion(t, client, user.OrganizationID, nil)
		template := coderdtest.CreateTemplate(t, client, user.OrganizationID, version.ID)

		// Set a default quota for the template
		_, err := client.SetTemplateQuotaDefault(context.Background(), template.ID.String(), codersdk.SetTemplateQuotaDefaultRequest{
			DefaultQuota: 10,
		})
		require.NoError(t, err)

		// Get quotas for the user
		quotas, err := client.GetUserTemplateQuotas(context.Background(), user.UserID.String())
		require.NoError(t, err)
		require.Equal(t, user.UserID.String(), quotas.UserID)

		// Should have one quota entry
		require.Len(t, quotas.Quotas, 1)
		require.Equal(t, template.ID.String(), quotas.Quotas[0].TemplateID)
		require.Equal(t, int64(10), quotas.Quotas[0].DefaultQuota)
		require.Equal(t, int64(0), quotas.Quotas[0].CurrentWorkspaces)
		require.False(t, quotas.Quotas[0].IsCustom)
	})

	t.Run("SetUserTemplateQuota", func(t *testing.T) {
		t.Parallel()

		client := coderdtest.New(t, &coderdtest.Options{
			IncludeProvisionerDaemon: true,
		})
		user := coderdtest.CreateFirstUser(t, client)

		// Create a template
		version := coderdtest.CreateTemplateVersion(t, client, user.OrganizationID, nil)
		template := coderdtest.CreateTemplate(t, client, user.OrganizationID, version.ID)

		// Set a custom quota for the user
		updated, err := client.SetUserTemplateQuota(context.Background(), user.UserID.String(), template.ID.String(), codersdk.SetUserTemplateQuotaRequest{
			WorkspaceQuota: 5,
		})
		require.NoError(t, err)
		require.Equal(t, int64(5), updated.WorkspaceQuota)

		// Verify the quota was set
		quotas, err := client.GetUserTemplateQuotas(context.Background(), user.UserID.String())
		require.NoError(t, err)
		require.Len(t, quotas.Quotas, 1)
		require.Equal(t, int64(5), quotas.Quotas[0].Quota)
		require.True(t, quotas.Quotas[0].IsCustom)
	})

	t.Run("ResetUserTemplateQuota", func(t *testing.T) {
		t.Parallel()

		client := coderdtest.New(t, &coderdtest.Options{
			IncludeProvisionerDaemon: true,
		})
		user := coderdtest.CreateFirstUser(t, client)

		// Create a template
		version := coderdtest.CreateTemplateVersion(t, client, user.OrganizationID, nil)
		template := coderdtest.CreateTemplate(t, client, user.OrganizationID, version.ID)

		// Set a default quota
		_, err := client.SetTemplateQuotaDefault(context.Background(), template.ID.String(), codersdk.SetTemplateQuotaDefaultRequest{
			DefaultQuota: 10,
		})
		require.NoError(t, err)

		// Set a custom quota
		_, err = client.SetUserTemplateQuota(context.Background(), user.UserID.String(), template.ID.String(), codersdk.SetUserTemplateQuotaRequest{
			WorkspaceQuota: 5,
		})
		require.NoError(t, err)

		// Verify custom quota
		quotas, err := client.GetUserTemplateQuotas(context.Background(), user.UserID.String())
		require.NoError(t, err)
		require.Equal(t, int64(5), quotas.Quotas[0].Quota)
		require.True(t, quotas.Quotas[0].IsCustom)

		// Reset to default
		err = client.ResetUserTemplateQuota(context.Background(), user.UserID.String(), template.ID.String())
		require.NoError(t, err)

		// Verify it's back to default
		quotas, err = client.GetUserTemplateQuotas(context.Background(), user.UserID.String())
		require.NoError(t, err)
		require.Equal(t, int64(10), quotas.Quotas[0].Quota)
		require.False(t, quotas.Quotas[0].IsCustom)
	})

	t.Run("GetAllTemplateQuotaDefaults", func(t *testing.T) {
		t.Parallel()

		client := coderdtest.New(t, &coderdtest.Options{
			IncludeProvisionerDaemon: true,
		})
		user := coderdtest.CreateFirstUser(t, client)

		// Create two templates
		version1 := coderdtest.CreateTemplateVersion(t, client, user.OrganizationID, nil)
		template1 := coderdtest.CreateTemplate(t, client, user.OrganizationID, version1.ID)

		version2 := coderdtest.CreateTemplateVersion(t, client, user.OrganizationID, nil)
		template2 := coderdtest.CreateTemplate(t, client, user.OrganizationID, version2.ID)

		// Set defaults for both
		_, err := client.SetTemplateQuotaDefault(context.Background(), template1.ID.String(), codersdk.SetTemplateQuotaDefaultRequest{
			DefaultQuota: 10,
		})
		require.NoError(t, err)

		_, err = client.SetTemplateQuotaDefault(context.Background(), template2.ID.String(), codersdk.SetTemplateQuotaDefaultRequest{
			DefaultQuota: 20,
		})
		require.NoError(t, err)

		// Get all defaults
		defaults, err := client.GetAllTemplateQuotaDefaults(context.Background())
		require.NoError(t, err)
		require.Len(t, defaults, 2)

		// Verify values
		defaultMap := make(map[string]int64)
		for _, d := range defaults {
			defaultMap[d.TemplateID.String()] = d.DefaultQuota
		}
		require.Equal(t, int64(10), defaultMap[template1.ID.String()])
		require.Equal(t, int64(20), defaultMap[template2.ID.String()])
	})

	t.Run("Authorization", func(t *testing.T) {
		t.Parallel()

		client := coderdtest.New(t, &coderdtest.Options{
			IncludeProvisionerDaemon: true,
		})
		user := coderdtest.CreateFirstUser(t, client)

		// Create another user
		_, client2 := coderdtest.CreateAnotherUser(t, client, user.OrganizationID)

		// Try to get quotas for the first user as the second user (should fail)
		_, err := client2.GetUserTemplateQuotas(context.Background(), user.UserID.String())
		require.Error(t, err)

		// Try to set quotas for another user (should fail)
		_, err = client2.SetUserTemplateQuota(context.Background(), user.UserID.String(), uuid.New().String(), codersdk.SetUserTemplateQuotaRequest{
			WorkspaceQuota: 5,
		})
		require.Error(t, err)
	})
}

func TestWorkspaceQuotaEnforcement(t *testing.T) {
	t.Parallel()

	t.Run("WorkspaceCreationRespectsQuota", func(t *testing.T) {
		t.Parallel()

		client := coderdtest.New(t, &coderdtest.Options{
			IncludeProvisionerDaemon: true,
		})
		user := coderdtest.CreateFirstUser(t, client)

		// Create a template
		version := coderdtest.CreateTemplateVersion(t, client, user.OrganizationID, nil)
		template := coderdtest.CreateTemplate(t, client, user.OrganizationID, version.ID)

		// Set quota to 2
		_, err := client.SetUserTemplateQuota(context.Background(), user.UserID.String(), template.ID.String(), codersdk.SetUserTemplateQuotaRequest{
			WorkspaceQuota: 2,
		})
		require.NoError(t, err)

		// Create first workspace - should succeed
		ws1 := coderdtest.CreateWorkspace(t, client, user.OrganizationID, template.ID)
		require.NotNil(t, ws1)

		// Create second workspace - should succeed
		ws2 := coderdtest.CreateWorkspace(t, client, user.OrganizationID, template.ID)
		require.NotNil(t, ws2)

		// Try to create third workspace - should fail with quota exceeded
		ctx, cancel := context.WithTimeout(context.Background(), testutil.IntervalSlow)
		defer cancel()

		_, err = client.CreateWorkspace(ctx, user.OrganizationID, codersdk.CreateWorkspaceRequest{
			TemplateID:        template.ID.String(),
			Name:              fmt.Sprintf("workspace-%d", time.Now().UnixNano()),
			AutostartSchedule: nil,
		})
		require.Error(t, err)
		var apiErr *codersdk.Error
		require.True(t, xerrors.As(err, &apiErr))
		require.Contains(t, apiErr.Message, "quota")
	})
}
