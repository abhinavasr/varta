const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, UserProfile, TokenBalance } = require('../models');
const { Op } = require('sequelize');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash: password, // Will be hashed by model hook
      is_active: true,
      is_verified: false
    });

    // Create user profile
    await UserProfile.create({
      user_id: user.id,
      display_name: username
    });

    // Create token balance with 0 tokens
    await TokenBalance.create({
      user_id: user.id,
      balance: 0.0
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        { model: UserProfile },
        { model: TokenBalance }
      ],
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.UserProfile,
        tokenBalance: user.TokenBalance ? user.TokenBalance.balance : 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { display_name, bio, location, website_url, skills, expertise } = req.body;

    const userProfile = await UserProfile.findOne({ where: { user_id: userId } });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    await userProfile.update({
      display_name: display_name || userProfile.display_name,
      bio: bio || userProfile.bio,
      location: location || userProfile.location,
      website_url: website_url || userProfile.website_url,
      skills: skills || userProfile.skills,
      expertise: expertise || userProfile.expertise,
      updated_at: new Date()
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: userProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
