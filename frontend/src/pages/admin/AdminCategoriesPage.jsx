import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { categoriesService } from '../../api/categoriesService';
import { useToast } from '../../context/ToastContext';
import { Layers, Plus, Clock, Building2, CheckCircle2 } from 'lucide-react';

export const AdminCategoriesPage = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    slaHours: 24,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesService.getCategories();
      const list = Array.isArray(response) ? response : response?.data || [];
      // If server returned list, use it; otherwise fallback to default configured taxonomy
      setCategories(list.length > 0 ? list : DEFAULT_CATEGORIES);
    } catch {
      // If backend categories endpoint is not initialized yet, display the default municipal categories
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      department: 'Public Works & Roads',
      slaHours: 24,
      description: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Name Required', 'Please enter a category name.');
      return;
    }

    setSaving(true);
    try {
      await categoriesService.createCategory(formData);
      toast.success('Category Configured', `${formData.name} added to system categories.`);
      setModalOpen(false);
      fetchCategories();
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
        title="Issue Categories & SLA Configuration"
        subtitle="Configure community problem categories, designated remediation departments, and statutory SLA resolution windows."
        actions={
          <GradientButton
            onClick={handleOpenCreate}
            role="admin"
            size="md"
            icon={Plus}
          >
            New Category
          </GradientButton>
        }
      />

      {loading ? (
        <SkeletonLoader count={4} type="card" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <GlassCard key={cat.id} tint="admin" className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> SLA: {cat.slaHours || 24} Hours
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#252238] mt-1">{cat.name}</h3>
                <p className="text-xs text-[#6B687A] mt-1 leading-relaxed">
                  {cat.description || 'Municipal repair category'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E9E5F0] flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1 font-semibold text-[#252238]">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate">{cat.department || 'Unassigned'}</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Category Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9E5F0] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-[#252238] mb-4">Add Issue Category</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Broken Fire Hydrants"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                    Target SLA (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={formData.slaHours}
                    onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                    Assigned Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Water Dept"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scope and problem definitions..."
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
                  Save Category
                </GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
