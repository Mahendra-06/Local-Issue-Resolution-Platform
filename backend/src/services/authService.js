import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { env } from '../config/env.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const authService = {
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  },

  async register({ name, email, password, phone, address, ward, role = 'citizen' }, req = null) {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Public registration only ever allows citizen role
    const assignedRole = 'citizen';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      ward: ward ? ward.trim() : '',
      isActive: true,
    });

    await logAuditEvent({
      action: 'USER_REGISTERED',
      entityType: 'user',
      targetId: user._id.toString(),
      actor: user,
      details: `New citizen registered: ${user.name} (${user.email})`,
      req,
    });

    const token = this.generateToken(user);
    const userJson = user.toJSON();

    return {
      token,
      accessToken: token,
      user: userJson,
    };
  },

  async registerStaff({ name, email, password, phone, employeeId, departmentId, authorizationCode }, req = null) {
    if (!authorizationCode || authorizationCode.trim() !== env.STAFF_INVITE_CODE) {
      const error = new Error('Invalid staff authorization or invitation code. Access requires verified organizational provisioning.');
      error.statusCode = 403;
      throw error;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      const error = new Error('An account with this work email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      const error = new Error('Selected department does not exist in the municipal registry.');
      error.statusCode = 404;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'staff',
      phone: phone ? phone.trim() : '',
      employeeId: employeeId ? employeeId.trim() : '',
      departmentId: department._id,
      departmentName: department.name,
      isActive: true,
    });

    await logAuditEvent({
      action: 'STAFF_REGISTERED',
      entityType: 'user',
      targetId: user._id.toString(),
      actor: user,
      details: `Authorized staff registered: ${user.name} (${user.email}) for department ${department.name}`,
      req,
    });

    const token = this.generateToken(user);
    const userJson = user.toJSON();

    return {
      token,
      accessToken: token,
      user: userJson,
    };
  },

  async registerManager({ name, email, password, phone, departmentId, authorizationCode }, req = null) {
    if (!authorizationCode || authorizationCode.trim() !== env.MANAGER_INVITE_CODE) {
      const error = new Error('Invalid administrator authorization code. Department manager provisioning requires system administrator approval.');
      error.statusCode = 403;
      throw error;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      const error = new Error('An account with this official work email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      const error = new Error('Selected department does not exist in the municipal registry.');
      error.statusCode = 404;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'manager',
      phone: phone ? phone.trim() : '',
      departmentId: department._id,
      departmentName: department.name,
      isActive: true,
    });

    await logAuditEvent({
      action: 'MANAGER_REGISTERED',
      entityType: 'user',
      targetId: user._id.toString(),
      actor: user,
      details: `Authorized manager registered: ${user.name} (${user.email}) for department ${department.name}`,
      req,
    });

    const token = this.generateToken(user);
    const userJson = user.toJSON();

    return {
      token,
      accessToken: token,
      user: userJson,
    };
  },

  async login({ email, password, requestedRole }, req = null) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      const error = new Error('No account found with this email address. Please register or verify the email entered.');
      error.statusCode = 401;
      throw error;
    }

    if (user.isActive === false) {
      const error = new Error('Your account has been deactivated. Please contact platform administration.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Incorrect password. Please verify your password and try again.');
      error.statusCode = 401;
      throw error;
    }

    await logAuditEvent({
      action: 'USER_LOGIN',
      entityType: 'auth',
      targetId: user._id.toString(),
      actor: user,
      details: `User signed in successfully with authoritative role: ${user.role} (requested: ${requestedRole || 'none'})`,
      req,
    });

    const token = this.generateToken(user);
    const userJson = user.toJSON();

    return {
      token,
      accessToken: token,
      user: userJson,
    };
  },

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  },

  async updateProfile(userId, profileData, req = null) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (profileData.name) user.name = profileData.name.trim();
    if (profileData.phone !== undefined) user.phone = profileData.phone.trim();
    if (profileData.address !== undefined) user.address = profileData.address.trim();

    await user.save();

    await logAuditEvent({
      action: 'PROFILE_UPDATED',
      entityType: 'user',
      targetId: user._id.toString(),
      actor: user,
      details: `User updated profile information`,
      req,
    });

    return user.toJSON();
  },
};
