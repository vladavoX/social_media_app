const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { UserInputError } = require('apollo-server');
const { validateRegisterInput } = require('../../util/validators')

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const User = require('../../models/User');

module.exports = {
  Mutation: { 
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
        id: res.id,
        username: res.username,
        email: res.email
      }, SECRET_KEY, { expiresIn: '1h' })

      return {
        ...res._doc,
        id: res._id,
        token
      }
    }
  }
}