import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_env_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1h";

export async function signUp(req, res) {
  try {
    const { fullname, email, password } = req.body;

    // 1. REQUIRED FIELDS CHECK
    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // 1.5. EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false,
      });
    }

    // 1.6. PASSWORD VALIDATION (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      });
    }

    // 2. CHECK IF USER ALREADY EXISTS
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    // 3. HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. CREATE USER
    const user = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await user.save();

    // 5. CREATE TOKEN
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    return res.status(201).json({
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
      token,
      success: true,
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}

export async function signIn(req, res) {
  try {
    const { email, password } = req.body;

    // 1. CHECK REQUIRED FIELDS
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
        success: false,
      });
    }

    // 2. FIND USER
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid credentials",
        success: false,
      });
    }

    // 3. COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid credentials",
        success: false,
      });
    }

    // 4. GENERATE TOKEN
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    return res.json({
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
      token,
      success: true,
    });
  } catch (error) {
    console.error("SignIn Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}
