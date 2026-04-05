import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// Role prefix map for user_id generation e.g. SUP_00001
const ROLE_PREFIX = {
  supplier:          'SUP',
  manufacturer:      'MAN',
  retailer:          'RET',
  warehouse_manager: 'WH'
};

const VALID_ROLES = Object.keys(ROLE_PREFIX);

// Generate next user_id for a given role e.g. SUP_00001, SUP_00002
const generateUserId = async (role) => {
  const prefix = ROLE_PREFIX[role];

  const existing = await prisma.user.findMany({
    where: { user_id: { startsWith: prefix + '_' } },
    select: { user_id: true },
    orderBy: { user_id: 'desc' }
  });

  if (existing.length === 0) {
    return `${prefix}_00001`;
  }

  // Extract the number from the last ID and increment
  const lastId   = existing[0].user_id;
  const lastNum  = parseInt(lastId.split('_')[1], 10);
  const nextNum  = String(lastNum + 1).padStart(5, '0');
  return `${prefix}_${nextNum}`;
};

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
  const user_id        = await generateUserId(role);

  const user = await prisma.user.create({
    data: {
      user_id,
      name,
      email,
      password: hashedPassword,
      role,
      contact_number: contact_number || null,
      address:        address || null
    }
  });

  return {
    user_id:  user.user_id,
    name:     user.name,
    email:    user.email,
    role:     user.role
  };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      name:    user.name,
      email:   user.email,
      role:    user.role
    }
  };
};