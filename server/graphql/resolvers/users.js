const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { UserInputError } = require('apollo-server');
const { validateRegisterInput, validateLoginInput } = require('../../util/validators')

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const User = require('../../models/User');

module.exports = {
  Mutation: {
    async login(_, { email, password }) { 
      const { errors, valid } = validateLoginInput(email, password);
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      const user = await User.findOne({ email });
      if (!user) {
        errors.email = 'User not found';
        throw new UserInputError('Errors', { errors });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.password = 'Password incorrect';
        throw new UserInputError('Errors', { errors });
      }
      
      const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email
      }, SECRET_KEY, { expiresIn: '1h' });

      return {
        ...user._doc,
        id: user._id,
        token
      }
    },
    async register(_,
      {
        registerInput: { username, email, password, confirmPassword }
      }, context, info) {
      // Validate user data
      const { errors, valid } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      // Make sure user doesn't already exist
      const userEmail = await User.findOne({ email });
      const userUsername = await User.findOne({ username });
      if (userEmail) { 
        throw new UserInputError('Email already exists', {
          errors: {
            email: 'Email already exists'
          }
        });
      } else if (userUsername) {
        throw new UserInputError('Username already exists', {
          errors: {
            username: 'Username already exists'
          }
        });
      }
      // hash password and create auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username, 
        password,
        createdAt: new Date().toISOString()
      })

      const res = await newUser.save()

      const token = jwt.sign({
        id: res._id,
        username: res.username,
        email: res.email
      }, SECRET_KEY, { expiresIn: '1h' });

      return {
        ...res._doc,
        id: res._id,
        token
      }
    }
  }
}