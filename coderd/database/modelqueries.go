package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"golang.org/x/xerrors"

	"github.com/coder/coder/v2/coderd/rbac"
	"github.com/coder/coder/v2/coderd/rbac/regosql"
)

const (
	authorizedQueryPlaceholder = "-- @authorize_filter"
)

// ExpectOne can be used to convert a ':many:' query into a ':one'
// query. To reduce the quantity of SQL queries, a :many with a filter is used.
// These filters sometimes are expected to return just 1 row.
//
// A :many query will never return a sql.ErrNoRows, but a :one does.
// This function will correct the error for the empty set.
func ExpectOne[T any](ret []T, err error) (T, error) {
	var empty T
	if err != nil {
		return empty, err
	}

	if len(ret) == 0 {
		return empty, sql.ErrNoRows
	}

	if len(ret) > 1 {
		return empty, xerrors.Errorf("too many rows returned, expected 1")
	}

	return ret[0], nil
}

// customQuerier encompasses all non-generated queries.
// It provides a flexible way to write queries for cases
// where sqlc proves inadequate.
type customQuerier interface {
	templateQuerier
	workspaceQuerier
	userQuerier
	auditLogQuerier
	connectionLogQuerier
	aibridgeQuerier
	chatQuerier
	quotaQuerier
}

type templateQuerier interface {
	GetAuthorizedTemplates(ctx context.Context, arg GetTemplatesWithFilterParams, prepared rbac.PreparedAuthorized) ([]Template, error)
	GetTemplateGroupRoles(ctx context.Context, id uuid.UUID) ([]TemplateGroup, error)
	GetTemplateUserRoles(ctx context.Context, id uuid.UUID) ([]TemplateUser, error)
}

func (q *sqlQuerier) GetAuthorizedTemplates(ctx context.Context, arg GetTemplatesWithFilterParams, prepared rbac.PreparedAuthorized) ([]Template, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.TemplateConverter(),
	})
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}

	filtered, err := insertAuthorizedFilter(getTemplatesWithFilter, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	// The name comment is for metric tracking
	query := fmt.Sprintf("-- name: GetAuthorizedTemplates :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		arg.Deleted,
		arg.OrganizationID,
		arg.ExactName,
		arg.ExactDisplayName,
		arg.FuzzyName,
		arg.FuzzyDisplayName,
		pq.Array(arg.IDs),
		arg.Deprecated,
		arg.HasAITask,
		arg.AuthorID,
		arg.AuthorUsername,
		arg.HasExternalAgent,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Template
	for rows.Next() {
		var i Template
		if err := rows.Scan(
			&i.ID,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.OrganizationID,
			&i.Deleted,
			&i.Name,
			&i.Provisioner,
			&i.ActiveVersionID,
			&i.Description,
			&i.DefaultTTL,
			&i.CreatedBy,
			&i.Icon,
			&i.UserACL,
			&i.GroupACL,
			&i.DisplayName,
			&i.AllowUserCancelWorkspaceJobs,
			&i.AllowUserAutostart,
			&i.AllowUserAutostop,
			&i.FailureTTL,
			&i.TimeTilDormant,
			&i.TimeTilDormantAutoDelete,
			&i.AutostopRequirementDaysOfWeek,
			&i.AutostopRequirementWeeks,
			&i.AutostartBlockDaysOfWeek,
			&i.RequireActiveVersion,
			&i.Deprecated,
			&i.ActivityBump,
			&i.MaxPortSharingLevel,
			&i.UseClassicParameterFlow,
			&i.CorsBehavior,
			&i.DisableModuleCache,
			&i.CreatedByAvatarURL,
			&i.CreatedByUsername,
			&i.CreatedByName,
			&i.OrganizationName,
			&i.OrganizationDisplayName,
			&i.OrganizationIcon,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

type TemplateUser struct {
	User
	Actions Actions `db:"actions"`
}

func (q *sqlQuerier) GetTemplateUserRoles(ctx context.Context, id uuid.UUID) ([]TemplateUser, error) {
	const query = `
	SELECT
		perms.value as actions, users.*
	FROM
		users
	JOIN
		(
			SELECT
				*
			FROM
				jsonb_each_text(
					(
						SELECT
							templates.user_acl
						FROM
							templates
						WHERE
							id = $1
					)
				)
		) AS perms
	ON
		users.id::text = perms.key
	WHERE
		users.deleted = false
	AND
		users.status != 'suspended';
	`

	var tus []TemplateUser
	err := q.db.SelectContext(ctx, &tus, query, id.String())
	if err != nil {
		return nil, xerrors.Errorf("select user actions: %w", err)
	}

	return tus, nil
}

type TemplateGroup struct {
	Group
	Actions Actions `db:"actions"`
}

func (q *sqlQuerier) GetTemplateGroupRoles(ctx context.Context, id uuid.UUID) ([]TemplateGroup, error) {
	const query = `
	SELECT
		perms.value as actions, groups.*
	FROM
		groups
	JOIN
		(
			SELECT
				*
			FROM
				jsonb_each_text(
					(
						SELECT
							templates.group_acl
						FROM
							templates
						WHERE
							id = $1
					)
				)
		) AS perms
	ON
		groups.id::text = perms.key;
	`

	var tgs []TemplateGroup
	err := q.db.SelectContext(ctx, &tgs, query, id.String())
	if err != nil {
		return nil, xerrors.Errorf("select group roles: %w", err)
	}

	return tgs, nil
}

type workspaceQuerier interface {
	GetAuthorizedWorkspaces(ctx context.Context, arg GetWorkspacesParams, prepared rbac.PreparedAuthorized) ([]GetWorkspacesRow, error)
	GetAuthorizedWorkspacesAndAgentsByOwnerID(ctx context.Context, ownerID uuid.UUID, prepared rbac.PreparedAuthorized) ([]GetWorkspacesAndAgentsByOwnerIDRow, error)
}

// GetAuthorizedWorkspaces returns all workspaces that the user is authorized to access.
// This code is copied from `GetWorkspaces` and adds the authorized filter WHERE
// clause.
func (q *sqlQuerier) GetAuthorizedWorkspaces(ctx context.Context, arg GetWorkspacesParams, prepared rbac.PreparedAuthorized) ([]GetWorkspacesRow, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, rbac.ConfigWorkspaces())
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}

	// In order to properly use ORDER BY, OFFSET, and LIMIT, we need to inject the
	// authorizedFilter between the end of the where clause and those statements.
	filtered, err := insertAuthorizedFilter(getWorkspaces, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	// The name comment is for metric tracking
	query := fmt.Sprintf("-- name: GetAuthorizedWorkspaces :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		pq.Array(arg.ParamNames),
		pq.Array(arg.ParamValues),
		arg.Deleted,
		arg.Status,
		arg.OwnerID,
		arg.OrganizationID,
		pq.Array(arg.HasParam),
		arg.OwnerUsername,
		arg.TemplateName,
		pq.Array(arg.TemplateIDs),
		pq.Array(arg.WorkspaceIds),
		arg.Name,
		pq.Array(arg.HasAgentStatuses),
		arg.AgentInactiveDisconnectTimeoutSeconds,
		arg.Dormant,
		arg.LastUsedBefore,
		arg.LastUsedAfter,
		arg.UsingActive,
		arg.HasAITask,
		arg.HasExternalAgent,
		arg.Shared,
		arg.SharedWithUserID,
		arg.SharedWithGroupID,
		arg.RequesterID,
		arg.Offset,
		arg.Limit,
		arg.WithSummary,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetWorkspacesRow
	for rows.Next() {
		var i GetWorkspacesRow
		if err := rows.Scan(
			&i.ID,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.OwnerID,
			&i.OrganizationID,
			&i.TemplateID,
			&i.Deleted,
			&i.Name,
			&i.AutostartSchedule,
			&i.Ttl,
			&i.LastUsedAt,
			&i.DormantAt,
			&i.DeletingAt,
			&i.AutomaticUpdates,
			&i.Favorite,
			&i.NextStartAt,
			&i.GroupACL,
			&i.UserACL,
			&i.OwnerAvatarUrl,
			&i.OwnerUsername,
			&i.OwnerName,
			&i.OrganizationName,
			&i.OrganizationDisplayName,
			&i.OrganizationIcon,
			&i.OrganizationDescription,
			&i.TemplateName,
			&i.TemplateDisplayName,
			&i.TemplateIcon,
			&i.TemplateDescription,
			&i.TaskID,
			&i.GroupACLDisplayInfo,
			&i.UserACLDisplayInfo,
			&i.TemplateVersionID,
			&i.TemplateVersionName,
			&i.LatestBuildCompletedAt,
			&i.LatestBuildCanceledAt,
			&i.LatestBuildError,
			&i.LatestBuildTransition,
			&i.LatestBuildStatus,
			&i.LatestBuildHasExternalAgent,
			&i.Count,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (q *sqlQuerier) GetAuthorizedWorkspacesAndAgentsByOwnerID(ctx context.Context, ownerID uuid.UUID, prepared rbac.PreparedAuthorized) ([]GetWorkspacesAndAgentsByOwnerIDRow, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, rbac.ConfigWorkspaces())
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}

	// In order to properly use ORDER BY, OFFSET, and LIMIT, we need to inject the
	// authorizedFilter between the end of the where clause and those statements.
	filtered, err := insertAuthorizedFilter(getWorkspacesAndAgentsByOwnerID, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	// The name comment is for metric tracking
	query := fmt.Sprintf("-- name: GetAuthorizedWorkspacesAndAgentsByOwnerID :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetWorkspacesAndAgentsByOwnerIDRow
	for rows.Next() {
		var i GetWorkspacesAndAgentsByOwnerIDRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.JobStatus,
			&i.Transition,
			pq.Array(&i.Agents),
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

type userQuerier interface {
	GetAuthorizedUsers(ctx context.Context, arg GetUsersParams, prepared rbac.PreparedAuthorized) ([]GetUsersRow, error)
}

func (q *sqlQuerier) GetAuthorizedUsers(ctx context.Context, arg GetUsersParams, prepared rbac.PreparedAuthorized) ([]GetUsersRow, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.UserConverter(),
	})
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}

	filtered, err := insertAuthorizedFilter(getUsers, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	query := fmt.Sprintf("-- name: GetAuthorizedUsers :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		arg.AfterID,
		arg.Search,
		arg.Name,
		pq.Array(arg.Status),
		pq.Array(arg.RbacRole),
		arg.LastSeenBefore,
		arg.LastSeenAfter,
		arg.CreatedBefore,
		arg.CreatedAfter,
		arg.IncludeSystem,
		arg.GithubComUserID,
		pq.Array(arg.LoginType),
		arg.OffsetOpt,
		arg.LimitOpt,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetUsersRow
	for rows.Next() {
		var i GetUsersRow
		if err := rows.Scan(
			&i.ID,
			&i.Email,
			&i.Username,
			&i.HashedPassword,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.Status,
			&i.RBACRoles,
			&i.LoginType,
			&i.AvatarURL,
			&i.Deleted,
			&i.LastSeenAt,
			&i.QuietHoursSchedule,
			&i.Name,
			&i.GithubComUserID,
			&i.HashedOneTimePasscode,
			&i.OneTimePasscodeExpiresAt,
			&i.IsSystem,
			&i.IsServiceAccount,
			&i.ChatSpendLimitMicros,
			&i.Count,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

type auditLogQuerier interface {
	GetAuthorizedAuditLogsOffset(ctx context.Context, arg GetAuditLogsOffsetParams, prepared rbac.PreparedAuthorized) ([]GetAuditLogsOffsetRow, error)
	CountAuthorizedAuditLogs(ctx context.Context, arg CountAuditLogsParams, prepared rbac.PreparedAuthorized) (int64, error)
}

func (q *sqlQuerier) GetAuthorizedAuditLogsOffset(ctx context.Context, arg GetAuditLogsOffsetParams, prepared rbac.PreparedAuthorized) ([]GetAuditLogsOffsetRow, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.AuditLogConverter(),
	})
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}

	filtered, err := insertAuthorizedFilter(getAuditLogsOffset, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	query := fmt.Sprintf("-- name: GetAuthorizedAuditLogsOffset :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		arg.ResourceType,
		arg.ResourceID,
		arg.OrganizationID,
		arg.ResourceTarget,
		arg.Action,
		arg.UserID,
		arg.Username,
		arg.Email,
		arg.DateFrom,
		arg.DateTo,
		arg.BuildReason,
		arg.RequestID,
		arg.OffsetOpt,
		arg.LimitOpt,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetAuditLogsOffsetRow
	for rows.Next() {
		var i GetAuditLogsOffsetRow
		if err := rows.Scan(
			&i.AuditLog.ID,
			&i.AuditLog.Time,
			&i.AuditLog.UserID,
			&i.AuditLog.OrganizationID,
			&i.AuditLog.Ip,
			&i.AuditLog.UserAgent,
			&i.AuditLog.ResourceType,
			&i.AuditLog.ResourceID,
			&i.AuditLog.ResourceTarget,
			&i.AuditLog.Action,
			&i.AuditLog.Diff,
			&i.AuditLog.StatusCode,
			&i.AuditLog.AdditionalFields,
			&i.AuditLog.RequestID,
			&i.AuditLog.ResourceIcon,
			&i.UserUsername,
			&i.UserName,
			&i.UserEmail,
			&i.UserCreatedAt,
			&i.UserUpdatedAt,
			&i.UserLastSeenAt,
			&i.UserStatus,
			&i.UserLoginType,
			&i.UserRoles,
			&i.UserAvatarUrl,
			&i.UserDeleted,
			&i.UserQuietHoursSchedule,
			&i.OrganizationName,
			&i.OrganizationDisplayName,
			&i.OrganizationIcon,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (q *sqlQuerier) CountAuthorizedAuditLogs(ctx context.Context, arg CountAuditLogsParams, prepared rbac.PreparedAuthorized) (int64, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.AuditLogConverter(),
	})
	if err != nil {
		return 0, xerrors.Errorf("compile authorized filter: %w", err)
	}

	filtered, err := insertAuthorizedFilter(countAuditLogs, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return 0, xerrors.Errorf("insert authorized filter: %w", err)
	}

	query := fmt.Sprintf("-- name: CountAuthorizedAuditLogs :one\n%s", filtered)

	rows, err := q.db.QueryContext(ctx, query,
		arg.ResourceType,
		arg.ResourceID,
		arg.OrganizationID,
		arg.ResourceTarget,
		arg.Action,
		arg.UserID,
		arg.Username,
		arg.Email,
		arg.DateFrom,
		arg.DateTo,
		arg.BuildReason,
		arg.RequestID,
	)
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	var count int64
	for rows.Next() {
		if err := rows.Scan(&count); err != nil {
			return 0, err
		}
	}
	if err := rows.Close(); err != nil {
		return 0, err
	}
	if err := rows.Err(); err != nil {
		return 0, err
	}
	return count, nil
}

type connectionLogQuerier interface {
	GetAuthorizedConnectionLogsOffset(ctx context.Context, arg GetConnectionLogsOffsetParams, prepared rbac.PreparedAuthorized) ([]GetConnectionLogsOffsetRow, error)
	CountAuthorizedConnectionLogs(ctx context.Context, arg CountConnectionLogsParams, prepared rbac.PreparedAuthorized) (int64, error)
}

func (q *sqlQuerier) GetAuthorizedConnectionLogsOffset(ctx context.Context, arg GetConnectionLogsOffsetParams, prepared rbac.PreparedAuthorized) ([]GetConnectionLogsOffsetRow, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.ConnectionLogConverter(),
	})
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}
	filtered, err := insertAuthorizedFilter(getConnectionLogsOffset, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	query := fmt.Sprintf("-- name: GetAuthorizedConnectionLogsOffset :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		arg.OrganizationID,
		arg.WorkspaceOwner,
		arg.WorkspaceOwnerID,
		arg.WorkspaceOwnerEmail,
		arg.Type,
		arg.UserID,
		arg.Username,
		arg.UserEmail,
		arg.ConnectedAfter,
		arg.ConnectedBefore,
		arg.WorkspaceID,
		arg.ConnectionID,
		arg.Status,
		arg.OffsetOpt,
		arg.LimitOpt,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetConnectionLogsOffsetRow
	for rows.Next() {
		var i GetConnectionLogsOffsetRow
		if err := rows.Scan(
			&i.ConnectionLog.ID,
			&i.ConnectionLog.ConnectTime,
			&i.ConnectionLog.OrganizationID,
			&i.ConnectionLog.WorkspaceOwnerID,
			&i.ConnectionLog.WorkspaceID,
			&i.ConnectionLog.WorkspaceName,
			&i.ConnectionLog.AgentName,
			&i.ConnectionLog.Type,
			&i.ConnectionLog.Ip,
			&i.ConnectionLog.Code,
			&i.ConnectionLog.UserAgent,
			&i.ConnectionLog.UserID,
			&i.ConnectionLog.SlugOrPort,
			&i.ConnectionLog.ConnectionID,
			&i.ConnectionLog.DisconnectTime,
			&i.ConnectionLog.DisconnectReason,
			&i.UserUsername,
			&i.UserName,
			&i.UserEmail,
			&i.UserCreatedAt,
			&i.UserUpdatedAt,
			&i.UserLastSeenAt,
			&i.UserStatus,
			&i.UserLoginType,
			&i.UserRoles,
			&i.UserAvatarUrl,
			&i.UserDeleted,
			&i.UserQuietHoursSchedule,
			&i.WorkspaceOwnerUsername,
			&i.OrganizationName,
			&i.OrganizationDisplayName,
			&i.OrganizationIcon,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (q *sqlQuerier) CountAuthorizedConnectionLogs(ctx context.Context, arg CountConnectionLogsParams, prepared rbac.PreparedAuthorized) (int64, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.ConnectionLogConverter(),
	})
	if err != nil {
		return 0, xerrors.Errorf("compile authorized filter: %w", err)
	}
	filtered, err := insertAuthorizedFilter(countConnectionLogs, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return 0, xerrors.Errorf("insert authorized filter: %w", err)
	}

	query := fmt.Sprintf("-- name: CountAuthorizedConnectionLogs :one\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		arg.OrganizationID,
		arg.WorkspaceOwner,
		arg.WorkspaceOwnerID,
		arg.WorkspaceOwnerEmail,
		arg.Type,
		arg.UserID,
		arg.Username,
		arg.UserEmail,
		arg.ConnectedAfter,
		arg.ConnectedBefore,
		arg.WorkspaceID,
		arg.ConnectionID,
		arg.Status,
	)
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	var count int64
	for rows.Next() {
		if err := rows.Scan(&count); err != nil {
			return 0, err
		}
	}
	if err := rows.Close(); err != nil {
		return 0, err
	}
	if err := rows.Err(); err != nil {
		return 0, err
	}
	return count, nil
}

type chatQuerier interface {
	GetAuthorizedChats(ctx context.Context, arg GetChatsParams, prepared rbac.PreparedAuthorized) ([]Chat, error)
}

func (q *sqlQuerier) GetAuthorizedChats(ctx context.Context, arg GetChatsParams, prepared rbac.PreparedAuthorized) ([]Chat, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, rbac.ConfigChats())
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}

	filtered, err := insertAuthorizedFilter(getChats, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	// The name comment is for metric tracking
	query := fmt.Sprintf("-- name: GetAuthorizedChats :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		arg.OwnerID,
		arg.Archived,
		arg.AfterID,
		arg.OffsetOpt,
		arg.LimitOpt,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Chat
	for rows.Next() {
		var i Chat
		if err := rows.Scan(
			&i.ID,
			&i.OwnerID,
			&i.WorkspaceID,
			&i.Title,
			&i.Status,
			&i.WorkerID,
			&i.StartedAt,
			&i.HeartbeatAt,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.ParentChatID,
			&i.RootChatID,
			&i.LastModelConfigID,
			&i.Archived,
			&i.LastError,
			&i.Mode,
			pq.Array(&i.MCPServerIDs),
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

type aibridgeQuerier interface {
	ListAuthorizedAIBridgeInterceptions(ctx context.Context, arg ListAIBridgeInterceptionsParams, prepared rbac.PreparedAuthorized) ([]ListAIBridgeInterceptionsRow, error)
	CountAuthorizedAIBridgeInterceptions(ctx context.Context, arg CountAIBridgeInterceptionsParams, prepared rbac.PreparedAuthorized) (int64, error)
	ListAuthorizedAIBridgeModels(ctx context.Context, arg ListAIBridgeModelsParams, prepared rbac.PreparedAuthorized) ([]string, error)
}

func (q *sqlQuerier) ListAuthorizedAIBridgeInterceptions(ctx context.Context, arg ListAIBridgeInterceptionsParams, prepared rbac.PreparedAuthorized) ([]ListAIBridgeInterceptionsRow, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.AIBridgeInterceptionConverter(),
	})
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}
	filtered, err := insertAuthorizedFilter(listAIBridgeInterceptions, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	query := fmt.Sprintf("-- name: ListAuthorizedAIBridgeInterceptions :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		arg.StartedAfter,
		arg.StartedBefore,
		arg.InitiatorID,
		arg.Provider,
		arg.Model,
		arg.Client,
		arg.AfterID,
		arg.Offset,
		arg.Limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListAIBridgeInterceptionsRow
	for rows.Next() {
		var i ListAIBridgeInterceptionsRow
		if err := rows.Scan(
			&i.AIBridgeInterception.ID,
			&i.AIBridgeInterception.InitiatorID,
			&i.AIBridgeInterception.Provider,
			&i.AIBridgeInterception.Model,
			&i.AIBridgeInterception.StartedAt,
			&i.AIBridgeInterception.Metadata,
			&i.AIBridgeInterception.EndedAt,
			&i.AIBridgeInterception.APIKeyID,
			&i.AIBridgeInterception.Client,
			&i.AIBridgeInterception.ThreadParentID,
			&i.AIBridgeInterception.ThreadRootID,
			&i.AIBridgeInterception.ClientSessionID,
			&i.VisibleUser.ID,
			&i.VisibleUser.Username,
			&i.VisibleUser.Name,
			&i.VisibleUser.AvatarURL,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (q *sqlQuerier) CountAuthorizedAIBridgeInterceptions(ctx context.Context, arg CountAIBridgeInterceptionsParams, prepared rbac.PreparedAuthorized) (int64, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.AIBridgeInterceptionConverter(),
	})
	if err != nil {
		return 0, xerrors.Errorf("compile authorized filter: %w", err)
	}
	filtered, err := insertAuthorizedFilter(countAIBridgeInterceptions, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return 0, xerrors.Errorf("insert authorized filter: %w", err)
	}

	query := fmt.Sprintf("-- name: CountAuthorizedAIBridgeInterceptions :one\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query,
		arg.StartedAfter,
		arg.StartedBefore,
		arg.InitiatorID,
		arg.Provider,
		arg.Model,
		arg.Client,
	)
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	var count int64
	for rows.Next() {
		if err := rows.Scan(&count); err != nil {
			return 0, err
		}
	}
	if err := rows.Close(); err != nil {
		return 0, err
	}
	if err := rows.Err(); err != nil {
		return 0, err
	}
	return count, nil
}

func (q *sqlQuerier) ListAuthorizedAIBridgeModels(ctx context.Context, arg ListAIBridgeModelsParams, prepared rbac.PreparedAuthorized) ([]string, error) {
	authorizedFilter, err := prepared.CompileToSQL(ctx, regosql.ConvertConfig{
		VariableConverter: regosql.AIBridgeInterceptionConverter(),
	})
	if err != nil {
		return nil, xerrors.Errorf("compile authorized filter: %w", err)
	}
	filtered, err := insertAuthorizedFilter(listAIBridgeModels, fmt.Sprintf(" AND %s", authorizedFilter))
	if err != nil {
		return nil, xerrors.Errorf("insert authorized filter: %w", err)
	}

	query := fmt.Sprintf("-- name: ListAIBridgeModels :many\n%s", filtered)
	rows, err := q.db.QueryContext(ctx, query, arg.Model, arg.Offset, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var model string
		if err := rows.Scan(&model); err != nil {
			return nil, err
		}
		items = append(items, model)
	}
	return items, nil
}

func insertAuthorizedFilter(query string, replaceWith string) (string, error) {
	if !strings.Contains(query, authorizedQueryPlaceholder) {
		return "", xerrors.Errorf("query does not contain authorized replace string, this is not an authorized query")
	}
	filtered := strings.Replace(query, authorizedQueryPlaceholder, replaceWith, 1)
	return filtered, nil
}

// UpdateUserLinkRawJSON is a custom query for unit testing. Do not ever expose this
func (q *sqlQuerier) UpdateUserLinkRawJSON(ctx context.Context, userID uuid.UUID, data json.RawMessage) error {
	_, err := q.sdb.ExecContext(ctx, "UPDATE user_links SET claims = $2 WHERE user_id = $1", userID, data)
	return err
}

// quotaQuerier contains custom queries for workspace quota management.
type quotaQuerier interface {
	GetUserWorkspaceCountByTemplate(ctx context.Context, userID, templateID string) (int64, error)
	GetUserCustomQuota(ctx context.Context, userID, templateID string) (int64, error)
	GetTemplateDefaultQuota(ctx context.Context, templateID string) (int64, error)
	GetAllUserTemplateQuotas(ctx context.Context, userID string) ([]UserTemplateQuotaRow, error)
	GetTemplateUsageByUser(ctx context.Context, userID string) ([]TemplateUsageByUserRow, error)
	GetAllTemplateQuotaDefaults(ctx context.Context) ([]TemplateQuotaDefaultRow, error)
	SetUserTemplateQuota(ctx context.Context, userID, templateID string, quota int64, updatedBy uuid.UUID) (UserTemplateQuotaRow, error)
	DeleteUserTemplateQuota(ctx context.Context, userID, templateID string) error
	SetTemplateQuotaDefault(ctx context.Context, templateID string, quota int64, updatedBy uuid.UUID) (TemplateQuotaDefaultRow, error)
}

// UserTemplateQuotaRow represents a user's custom quota for a template.
type UserTemplateQuotaRow struct {
	UserID         uuid.UUID
	TemplateID     uuid.UUID
	WorkspaceQuota int64
	CreatedAt      time.Time
	UpdatedAt      time.Time
	UpdatedBy      uuid.UUID
}

// TemplateUsageByUserRow represents template usage statistics for a user.
type TemplateUsageByUserRow struct {
	TemplateID          uuid.UUID
	TemplateName        string
	TemplateDisplayName string
	TemplateIcon        string
	WorkspaceCount      int64
}

// TemplateQuotaDefaultRow represents a template's default quota.
type TemplateQuotaDefaultRow struct {
	TemplateID          uuid.UUID
	DefaultQuota        int64
	UpdatedAt           time.Time
	UpdatedBy           uuid.UUID
	TemplateName        string
	TemplateDisplayName string
	TemplateIcon        string
}

// GetUserWorkspaceCountByTemplate counts how many workspaces a user has created using a specific template.
func (q *sqlQuerier) GetUserWorkspaceCountByTemplate(ctx context.Context, userID, templateID string) (int64, error) {
	row := q.sdb.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM workspaces
		WHERE owner_id = $1 AND template_id = $2 AND deleted = false
	`, userID, templateID)

	var count int64
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// GetUserCustomQuota retrieves a user's custom quota for a specific template.
func (q *sqlQuerier) GetUserCustomQuota(ctx context.Context, userID, templateID string) (int64, error) {
	row := q.sdb.QueryRowContext(ctx, `
		SELECT workspace_quota
		FROM user_template_quotas
		WHERE user_id = $1 AND template_id = $2
	`, userID, templateID)

	var quota int64
	err := row.Scan(&quota)
	if err != nil {
		return 0, err
	}
	return quota, nil
}

// GetTemplateDefaultQuota retrieves the default quota for a template.
func (q *sqlQuerier) GetTemplateDefaultQuota(ctx context.Context, templateID string) (int64, error) {
	row := q.sdb.QueryRowContext(ctx, `
		SELECT default_quota
		FROM template_quota_defaults
		WHERE template_id = $1
	`, templateID)

	var quota int64
	err := row.Scan(&quota)
	if err != nil {
		return 0, err
	}
	return quota, nil
}

// GetAllUserTemplateQuotas retrieves all custom quotas for a user.
func (q *sqlQuerier) GetAllUserTemplateQuotas(ctx context.Context, userID string) ([]UserTemplateQuotaRow, error) {
	rows, err := q.sdb.QueryContext(ctx, `
		SELECT user_id, template_id, workspace_quota, created_at, updated_at, updated_by
		FROM user_template_quotas
		WHERE user_id = $1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var quotas []UserTemplateQuotaRow
	for rows.Next() {
		var q UserTemplateQuotaRow
		err := rows.Scan(&q.UserID, &q.TemplateID, &q.WorkspaceQuota, &q.CreatedAt, &q.UpdatedAt, &q.UpdatedBy)
		if err != nil {
			return nil, err
		}
		quotas = append(quotas, q)
	}

	return quotas, rows.Err()
}

// GetTemplateUsageByUser retrieves workspace usage breakdown by template for a user.
func (q *sqlQuerier) GetTemplateUsageByUser(ctx context.Context, userID string) ([]TemplateUsageByUserRow, error) {
	rows, err := q.sdb.QueryContext(ctx, `
		SELECT w.template_id, t.name as template_name, t.display_name as template_display_name,
		       t.icon as template_icon, COUNT(w.id) as workspace_count
		FROM workspaces w
		JOIN templates t ON w.template_id = t.id
		WHERE w.owner_id = $1 AND w.deleted = false
		GROUP BY w.template_id, t.name, t.display_name, t.icon
		ORDER BY workspace_count DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usage []TemplateUsageByUserRow
	for rows.Next() {
		var u TemplateUsageByUserRow
		err := rows.Scan(&u.TemplateID, &u.TemplateName, &u.TemplateDisplayName, &u.TemplateIcon, &u.WorkspaceCount)
		if err != nil {
			return nil, err
		}
		usage = append(usage, u)
	}

	return usage, rows.Err()
}

// GetAllTemplateQuotaDefaults retrieves all template default quotas.
func (q *sqlQuerier) GetAllTemplateQuotaDefaults(ctx context.Context) ([]TemplateQuotaDefaultRow, error) {
	rows, err := q.sdb.QueryContext(ctx, `
		SELECT tqd.template_id, tqd.default_quota, tqd.updated_at, tqd.updated_by,
		       t.name as template_name, t.display_name as template_display_name, t.icon as template_icon
		FROM template_quota_defaults tqd
		JOIN templates t ON tqd.template_id = t.id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var quotas []TemplateQuotaDefaultRow
	for rows.Next() {
		var q TemplateQuotaDefaultRow
		err := rows.Scan(&q.TemplateID, &q.DefaultQuota, &q.UpdatedAt, &q.UpdatedBy, &q.TemplateName, &q.TemplateDisplayName, &q.TemplateIcon)
		if err != nil {
			return nil, err
		}
		quotas = append(quotas, q)
	}

	return quotas, rows.Err()
}

// SetUserTemplateQuota sets or updates a user's quota for a template.
func (q *sqlQuerier) SetUserTemplateQuota(ctx context.Context, userID, templateID string, quota int64, updatedBy uuid.UUID) (UserTemplateQuotaRow, error) {
	var row UserTemplateQuotaRow
	err := q.sdb.QueryRowContext(ctx, `
		INSERT INTO user_template_quotas (user_id, template_id, workspace_quota, updated_by)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, template_id)
		DO UPDATE SET
			workspace_quota = EXCLUDED.workspace_quota,
			updated_at = NOW(),
			updated_by = EXCLUDED.updated_by
		RETURNING user_id, template_id, workspace_quota, created_at, updated_at, updated_by
	`, userID, templateID, quota, updatedBy).Scan(
		&row.UserID, &row.TemplateID, &row.WorkspaceQuota, &row.CreatedAt, &row.UpdatedAt, &row.UpdatedBy,
	)

	return row, err
}

// DeleteUserTemplateQuota deletes a user's custom quota for a template.
func (q *sqlQuerier) DeleteUserTemplateQuota(ctx context.Context, userID, templateID string) error {
	_, err := q.sdb.ExecContext(ctx, `
		DELETE FROM user_template_quotas
		WHERE user_id = $1 AND template_id = $2
	`, userID, templateID)
	return err
}

// SetTemplateQuotaDefault sets or updates the default quota for a template.
func (q *sqlQuerier) SetTemplateQuotaDefault(ctx context.Context, templateID string, quota int64, updatedBy uuid.UUID) (TemplateQuotaDefaultRow, error) {
	var row TemplateQuotaDefaultRow
	err := q.sdb.QueryRowContext(ctx, `
		INSERT INTO template_quota_defaults (template_id, default_quota, updated_by)
		VALUES ($1, $2, $3)
		ON CONFLICT (template_id)
		DO UPDATE SET
			default_quota = EXCLUDED.default_quota,
			updated_at = NOW(),
			updated_by = EXCLUDED.updated_by
		RETURNING template_id, default_quota, updated_at
	`, templateID, quota, updatedBy).Scan(
		&row.TemplateID, &row.DefaultQuota, &row.UpdatedAt,
	)

	return row, err
}
