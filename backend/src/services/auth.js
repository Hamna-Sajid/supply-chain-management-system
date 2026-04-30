import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import prisma from '../config/db.js';

const VALID_ROLES = ['supplier', 'manufacturer', 'retailer', 'warehouse_manager'];

export const signup = async ({ name, email, password, role, contact_number, address }) => {
  // Validate role
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
  }

  // Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error(
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    );
  }

  // Check duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('User with this email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      user_id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      role,
      contact_number: contact_number || null,
      address: address || null
    }
  });

  return {
    userId: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');

  const token = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      userId: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};