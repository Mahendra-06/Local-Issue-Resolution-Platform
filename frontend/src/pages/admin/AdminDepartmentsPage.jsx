import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { departmentsService } from '../../api/departmentsService';
import { useToast } from '../../context/ToastContext';
import { Building2, Plus, Edit2, Users, MapPin, CheckCircle, Shield } from 'lucide-react';

export const AdminDepartmentsPage = () => {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    serviceArea: '',
    contactEmail: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentsService.getDepartments();
      const list = Array.isArray(response) ? response : response?.data || [];
      setDepartments(list);
    } catch (err) {
      setError(err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      serviceArea: '',
      contactEmail: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      serviceArea: dept.serviceArea || '',
      contactEmail: dept.contactEmail || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Name Required', 'Please provide a department name.');
      return;
    }

    setSaving(true);
    try {
      if (editingDept) {
        await departmentsService.updateDepartment(editingDept.id, formData);
        toast.success('Department Updated', `${formData.name} configuration updated.`);
      } else {
        await departmentsService.createDepartment(formData);
        toast.success('Department Created', `${formData.name} added to municipal directory.`);
      }

      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error('Action Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        title="Department Management"
        subtitle="Configure municipal departments, dispatch jurisdictions, division codes, and operational contact points."
        actions={
          <GradientButton
            onClick={handleOpenCreate}
            role="admin"
            size="md"
            icon={Plus}
          >
            Add Department
          </GradientButton>
        }
      />

      {error && (
        <ErrorState
          title="Could Not Load Departments"
          message="Failed to retrieve department configurations from the server."
          error={error}
          onRetry={fetchDepartments}
          role="admin"
        />
      )}

      {loading && !error && <SkeletonLoader count={4} type="card" />}

      {!loading && !error && departments.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No Departments Configured"
          message="There are currently no departments registered on this CivicPulse server."
          action={
            <GradientButton onClick={handleOpenCreate} role="admin" size="sm" icon={Plus}>
              Create First Department
            </GradientButton>
          }
        />
      )}

      {!loading && !error && departments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <GlassCard key={dept.id || dept._id} tint="admin" className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                    {dept.code || 'DEPT'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Edit Department"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-base text-[#252238]">{dept.name}</h3>
                <p className="text-xs text-[#6B687A] mt-1 line-clamp-2 leading-relaxed">
                  {dept.description || 'Municipal remediation division'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E9E5F0] space-y-2 text-xs text-[#6B687A]">
                {dept.serviceArea && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">Service Area: {dept.serviceArea}</span>
                  </div>
                )}
                {dept.contactEmail && (
                  <div className="text-[11px] text-gray-400 font-mono truncate">
                    Contact: {dept.contactEmail}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create / Edit Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E9E5F0] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-[#252238] mb-4">
              {editingDept ? 'Edit Municipal Department' : 'Create New Department'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Solid Waste Management"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. SWM-01"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="dept@city.gov"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                  Service Area Jurisdiction
                </label>
                <input
                  type="text"
                  value={formData.serviceArea}
                  onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                  placeholder="e.g. Greater Metropolitan Wards 1 to 24"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Responsibilities, scope, and division remit..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="pt-4 border-t border-[#E9E5F0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <GradientButton
                  type="submit"
                  role="admin"
                  size="md"
                  loading={saving}
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
