import { Category } from '../models/Category.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const categoriesController = {
  async getCategories(req, res, next) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ name: 1 });
      return ApiResponse.success(res, categories.map((c) => c.toJSON()), 'Categories retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async getCategoryById(req, res, next) {
    try {
      const category = await Category.findOne({
        $or: [{ key: req.params.id }, { _id: req.params.id }],
      });
      if (!category) {
        return ApiResponse.error(res, 'Category not found', 404);
      }
      return ApiResponse.success(res, category.toJSON(), 'Category retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req, res, next) {
    try {
      const key = req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const category = await Category.create({
        ...req.body,
        key,
      });

      await logAuditEvent({
        action: 'CATEGORY_CREATED',
        entityType: 'category',
        targetId: category._id.toString(),
        actor: req.user,
        details: `Created category: ${category.name} (SLA: ${category.slaHours}h)`,
        req,
      });

      return ApiResponse.success(res, category.toJSON(), 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!category) {
        return ApiResponse.error(res, 'Category not found', 404);
      }

      await logAuditEvent({
        action: 'CATEGORY_UPDATED',
        entityType: 'category',
        targetId: category._id.toString(),
        actor: req.user,
        details: `Updated category: ${category.name}`,
        req,
      });

      return ApiResponse.success(res, category.toJSON(), 'Category updated successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return ApiResponse.error(res, 'Category not found', 404);
      }

      await logAuditEvent({
        action: 'CATEGORY_DELETED',
        entityType: 'category',
        targetId: category._id.toString(),
        actor: req.user,
        details: `Deleted category: ${category.name}`,
        req,
      });

      return ApiResponse.success(res, null, 'Category deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  },
};
