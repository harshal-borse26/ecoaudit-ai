import { createFacility, getFacilities , getFacilityById, updateFacility, deleteFacility} from "../services/facilityService.js";

export const addFacility = async (req, res) => {
  try {
    const result = await createFacility(
      req.body,
      req.user.companyId
    );

    return res.status(201).json({
      success: true,
      message: "Facility created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await getFacilities(req.user.companyId);

    return res.status(200).json({
      success: true,
      data: facilities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFacility = async (req, res) => {
  try {
    const facility = await getFacilityById(
      req.params.id,
      req.user.companyId
    );

    return res.status(200).json({
      success: true,
      data: facility,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const editFacility = async (req, res) => {
  try {
    const facility = await updateFacility(
      req.params.id,
      req.user.companyId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Facility updated successfully",
      data: facility,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeFacility = async (req, res) => {
  try {
    await deleteFacility(
      req.params.id,
      req.user.companyId
    );

    return res.status(200).json({
      success: true,
      message: "Facility deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};