import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerCompany = async (data) => {
  const {
    companyName,
    industry,
    phone,
    country,
    state,
    city,
    fullName,
    email,
    password,
  } = data;

  // Required field validation
  if (
    !companyName ||
    !industry ||
    !phone ||
    !country ||
    !state ||
    !city ||
    !fullName ||
    !email ||
    !password
  ) {
    throw new Error("All fields are required");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Password validation
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Transaction
  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        companyName,
        industry,
        phone,
        country,
        state,
        city,
      },
    });

    const user = await tx.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: "ADMIN",
        companyId: company.id,
      },
    });

    return {
      company,
      user,
    };
  });

  return {
    company: result.company,
    user: {
      id: result.user.id,
      fullName: result.user.fullName,
      email: result.user.email,
      role: result.user.role,
    },
  };
};

export const loginUser = async (data) => {
  const { email, password } = data;

  // Validate input
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  };
};


export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      company: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    company: {
      id: user.company.id,
      companyName: user.company.companyName,
      industry: user.company.industry,
      city: user.company.city,
      state: user.company.state,
      country: user.company.country,
    },
  };
};
