const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    name: { type: String, required: true },
    password: { type: String, required: true },
    photoURL: { type: String, default: "" },
    role: { type: String, enum: ["citizen", "authority", "admin"], default: "citizen" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: "" },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: true },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
