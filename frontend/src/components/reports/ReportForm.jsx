import React, { useState, useEffect } from 'react';
import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { PhotoUploader } from './PhotoUploader';
import { LocationPicker } from './LocationPicker';
import { categoriesService } from '../../api/categoriesService';
import { reportsService } from '../../api/reportsService';
import { useToast } from '../../context/ToastContext';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

export const ReportForm = ({ onSuccess = null, className = '' }) => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    address: '',
    latitude: 12.9716,
    longitude: 77.5946,
    photoFile: null,
    photoUrl: null,
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await categoriesService.getCategories();
        const list = Array.isArray(response) ? response : response?.data || [];
        setCategories(list);
        if (list.length > 0) {
          const queryParamCat = new URLSearchParams(window.location.search).get('category');
          const matched = list.find(
            (c) => c.id === queryParamCat || c.key === queryParamCat || c._id === queryParamCat
          );
          const selectedId = matched
            ? matched.id || matched.key || matched._id
            : list[0].id || list[0].key || list[0]._id;
          setFormData((prev) => ({ ...prev, categoryId: selectedId }));
        }
      } catch (err) {
        console.error('Failed to load categories from database:', err);
      }
    };
    fetchCats();
  }, []);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Please provide an issue title.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please describe the problem.';
    } else if (formData.description.trim().length < 15) {
      errs.description = 'Description must be at least 15 characters.';
    }

    if (!formData.categoryId) {
      errs.categoryId = 'Please select a problem category.';
    }

    if (!formData.address.trim()) {
      errs.address = 'Please specify the street address or landmark.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      let uploadedPhotoUrl = null;

      // If user selected an image file, upload it through the API client
      if (formData.photoFile) {
        try {
          const uploadRes = await reportsService.uploadPhoto(formData.photoFile);
          uploadedPhotoUrl = uploadRes?.url || uploadRes?.photoUrl || null;
        } catch (uploadErr) {
          console.warn('Photo upload failed or endpoint unsupported:', uploadErr);
          // Non-blocking: proceed with report submission if user wishes
        }
      }

      // Submit report to authoritative backend
      const reportPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        address: formData.address.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        photoUrl: uploadedPhotoUrl || formData.photoUrl,
      };

      const result = await reportsService.createReport(reportPayload);

      // Only show success once server confirmed!
      toast.success(
        'Report Submitted Successfully',
        `Your report #${result?.id || result?.referenceId || ''} has been registered with municipal departments.`
      );

      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: categories[0] ? (categories[0].id || categories[0].key || categories[0]._id) : '',
        address: '',
        latitude: 12.9716,
        longitude: 77.5946,
        photoFile: null,
        photoUrl: null,
      });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setServerError(err.message || 'Failed to submit report. Please check server connectivity.');
      toast.error('Submission Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className={`p-6 sm:p-8 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {serverError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Submission Error:</span>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label
            htmlFor="report-title"
            className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1.5"
          >
            Problem Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="report-title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Deep pothole causing tire damage near 5th Main cross"
            className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-[#252238] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all ${
              errors.title ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E9E5F0]'
            }`}
          />
          {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
        </div>

        {/* Category & Department */}
        <div>
          <label
            htmlFor="report-category"
            className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1.5"
          >
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="report-category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-4 py-2.5 text-sm bg-white border border-[#E9E5F0] rounded-xl text-[#252238] focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all"
          >
            {categories.length === 0 && <option value="">Loading categories...</option>}
            {categories.map((cat) => {
              const catId = cat.id || cat.key || cat._id;
              return (
                <option key={catId} value={catId}>
                  {cat.name} — ({cat.department || 'Municipal Division'}, SLA: {cat.slaHours || 24}h)
                </option>
              );
            })}
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="report-description"
            className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1.5"
          >
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="report-description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide context, approximate dimensions, safety hazards, or duration the problem has persisted..."
            className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl text-[#252238] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all ${
              errors.description ? 'border-rose-400 focus:ring-rose-300' : 'border-[#E9E5F0]'
            }`}
          />
          {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
        </div>

        {/* Photo Uploader */}
        <PhotoUploader
          onFileSelect={(file, previewUrl) =>
            setFormData({ ...formData, photoFile: file, photoUrl: previewUrl })
          }
          previewUrl={formData.photoUrl}
          disabled={submitting}
        />

        {/* Location & Map Picker */}
        <LocationPicker
          address={formData.address}
          latitude={formData.latitude}
          longitude={formData.longitude}
          onChange={(loc) =>
            setFormData({
              ...formData,
              address: loc.address,
              latitude: loc.latitude,
              longitude: loc.longitude,
            })
          }
          error={errors.address}
        />

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#E9E5F0] flex items-center justify-end">
          <GradientButton
            type="submit"
            role="citizen"
            size="lg"
            loading={submitting}
            icon={Send}
            iconPosition="right"
            className="w-full sm:w-auto"
          >
            Submit Incident Report
          </GradientButton>
        </div>
      </form>
    </GlassCard>
  );
};
