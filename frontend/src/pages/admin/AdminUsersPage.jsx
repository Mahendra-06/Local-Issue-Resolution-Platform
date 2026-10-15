import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { DataTable } from '../../components/common/DataTable';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { ErrorState } from '../../components/common/ErrorState';
import { usersService } from '../../api/usersService';
import { useToast } from '../../context/ToastContext';
import { USER_ROLES, ROLE_CONFIG } from '../../constants/roles';
import { Users, UserCheck, ShieldAlert, Edit2, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';

export const AdminUsersPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit role modal state
  const [editingUser, setEditingUser] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  // Toggle status dialog state
  const [statusUser, setStatusUser] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersService.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        page,
        limit: 10,
      });

      if (Array.isArray(response)) {
        setUsers(response);
        setTotalCount(response.length);
        setTotalPages(1);
      } else if (response?.data && Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalCount(response.total || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.total || response.data.length) / 10) || 1);
      } else {
        setUsers([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveRole = async () => {
    if (!editingUser || !targetRole) return;
    setSavingRole(true);
    try {
      await usersService.updateUserRole(editingUser.id, targetRole);
      toast.success('Role Updated', `User ${editingUser.name} role changed to ${targetRole}.`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to Update Role', err.message);
    } finally {
      setSavingRole(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusUser) return;
    setTogglingStatus(true);
    try {
      const nextStatus = statusUser.isActive !== false ? false : true;
      await usersService.toggleUserStatus(statusUser.id, nextStatus);
      toast.success(
        'Account Status Updated',
        `Account for ${statusUser.name} is now ${nextStatus ? 'Active' : 'Deactivated'}.`
      );
      setStatusUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to Update Status', err.message);
    } finally {
      setTogglingStatus(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'User & Email',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="font-bold text-sm text-[#252238]">{item.name}</p>
            <p className="text-xs text-[#6B687A]">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (item) => {
        const conf = ROLE_CONFIG[item.role?.toLowerCase()] || {
          name: item.role,
          badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return (
          <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${conf.badgeClass}`}>
            {conf.name}
          </span>
        );
      },
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => (
        <span className="text-xs text-[#252238] font-medium">
          {item.departmentName || item.department?.name || '—'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Account Status',
      render: (item) => {
        const active = item.isActive !== false;
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{active ? 'Active' : 'Disabled'}</span>
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (item) => (
        <span className="text-xs text-[#6B687A]">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingUser(item);
              setTargetRole(item.role?.toLowerCase() || 'citizen');
            }}
            className="p-1.5 rounded-lg text-indigo-700 hover:bg-indigo-50 transition-colors"
            title="Modify role"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setStatusUser(item)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              item.isActive !== false
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={item.isActive !== false ? 'Deactivate account' : 'Reactivate account'}
          >
            {item.isActive !== false ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        title="Platform User Management"
        subtitle="Manage authenticated users, govern role-based permissions, and oversee account activation status."
      />

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#E9E5F0] shadow-sm">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by name or email..."
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none"
          >
            <option value="">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="staff">Department Staff</option>
            <option value="manager">Department Managers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Could Not Load Users"
          message="Failed to fetch user accounts from the backend."
          error={error}
          onRetry={fetchUsers}
          role="admin"
        />
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No Users Found"
        emptyMessage="No accounts matching the search query or role filter were found."
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        onPageChange={setPage}
      />

      {/* Edit Role Modal */}
      <ConfirmDialog
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onConfirm={handleSaveRole}
        loading={savingRole}
        type="info"
        role="admin"
        title={`Change Role: ${editingUser?.name}`}
        message="Select the new authorized platform role. This changes access rights immediately on the server."
        confirmText="Save Role Assignment"
      >
        <div className="mt-3">
          <label className="block text-xs font-bold text-gray-700 mb-1">Select System Role</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-xl outline-none"
          >
            <option value={USER_ROLES.CITIZEN}>Citizen (Problem reporting & tracking)</option>
            <option value={USER_ROLES.STAFF}>Department Staff (Field operations & evidence)</option>
            <option value={USER_ROLES.MANAGER}>Department Manager (Review, assign, verify)</option>
            <option value={USER_ROLES.ADMIN}>Administrator (Full system oversight)</option>
          </select>
        </div>
      </ConfirmDialog>

      {/* Toggle Account Status Dialog */}
      <ConfirmDialog
        isOpen={Boolean(statusUser)}
        onClose={() => setStatusUser(null)}
        onConfirm={handleToggleStatus}
        loading={togglingStatus}
        type={statusUser?.isActive !== false ? 'danger' : 'success'}
        role="admin"
        title={
          statusUser?.isActive !== false
            ? `Deactivate ${statusUser?.name}'s Account`
            : `Reactivate ${statusUser?.name}'s Account`
        }
        message={
          statusUser?.isActive !== false
            ? 'Deactivating this user will revoke API access and session tokens immediately.'
            : 'Reactivating this user restores normal login and dashboard permissions.'
        }
        confirmText={statusUser?.isActive !== false ? 'Confirm Deactivation' : 'Confirm Reactivation'}
      />
    </div>
  );
};
