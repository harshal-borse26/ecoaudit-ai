import { registerCompany, loginUser , getCurrentUser} from "../services/authService.js";

export const signup = async (req, res) => {
  try {
    const result = await registerCompany(req.body);

    return res.status(201).json({
      success: true,
      message: "Company registered successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const profile = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    user: req.user,
  });
};

export const me = async (req, res) => {
  try {
    const result = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};