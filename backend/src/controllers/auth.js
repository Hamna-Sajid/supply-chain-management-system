import { signup as signupService, login as loginService } from '../service/auth.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, contact_number, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password and role are required' });
    }

    const user = await signupService({ name, email, password, role, contact_number, address });

    res.status(201).json({
      message: 'Account created successfully',
      user
    });
  } catch (error) {
    console.error('Signup error:', error);
    const status = error.message.includes('already exists') ||
                   error.message.includes('Invalid role') ||
                   error.message.includes('Password must')
                   ? 400 : 500;
    res.status(status).json({ error: error.message || 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await loginService({ email, password });

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    const status = error.message === 'Invalid credentials' ? 401 : 500;
    res.status(status).json({ error: error.message || 'Server error' });
  }
};