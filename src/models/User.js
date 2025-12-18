import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'policeman'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
  badgeNumber: {
    type: String,
    sparse: true // Only required for police officers
  },
  district: {
    type: String,
    sparse: true
  },
  profileImage: {
    type: String,
    default: '' // URL to default avatar
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-duty', 'off-duty'],
    default: 'active'
  }
});

// Hash password before save if changed
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password match method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User ;
