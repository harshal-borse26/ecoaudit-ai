import {
  createBill,
  getBillById,
  getBills,
  updateBill,
  deleteBill,
} from "../services/utilityBillService.js";
import { extractBillData } from "../services/aiService.js";
import { processBillAI } from "../services/utilityBillService.js";
import { uploadFileToS3, generatePresignedUrlFromKey, getS3KeyFromUrl } from "../services/s3Service.js";

export const addBill = async (req, res) => {
  try {
    let billFileUrl = null;
    let billFileKey = null;

    // Upload file to Amazon S3
    if (req.file) {
      const uploadResult = await uploadFileToS3(req.file);
      billFileUrl = uploadResult.url;
      billFileKey = uploadResult.key;
    }

    // Build request payload
    const payload = {
      ...req.body,
      billFileUrl,
      billFileKey,
    };

    const result = await createBill(payload, req.user.companyId);

    return res.status(201).json({
      success: true,
      message: "Utility bill created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBillFileUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const mode = req.query.mode === "download" ? "download" : "preview";

    const bill = await getBillById(id, req.user.companyId);

    const key = bill.billFileKey || (bill.billFileUrl ? getS3KeyFromUrl(bill.billFileUrl) : null);

    if (!key) {
      return res.status(404).json({
        success: false,
        message: "No document file associated with this utility bill record.",
      });
    }

    const presignedUrl = await generatePresignedUrlFromKey(key, {
      mode,
      expiresIn: 900,
    });

    return res.status(200).json({
      success: true,
      data: {
        url: presignedUrl,
        mode,
        key,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBills = async (req, res) => {
  try {
    const bills = await getBills(req.user.companyId);

    return res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBill = async (req, res) => {
  try {
    const bill = await getBillById(req.params.id, req.user.companyId);

    return res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const editBill = async (req, res) => {
  try {
    const bill = await updateBill(req.params.id, req.user.companyId, req.body);

    return res.status(200).json({
      success: true,
      message: "Utility bill updated successfully",
      data: bill,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeBill = async (req, res) => {
  try {
    await deleteBill(req.params.id, req.user.companyId);

    return res.status(200).json({
      success: true,
      message: "Utility bill deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const testAI = async (req, res) => {
  try {
    // const result = await extractBillData(req.body.billText);
    const result = await extractBillData(req.body.billFileUrl);
    return res.json(result);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const processBill = async (req, res) => {
  try {
    const bill = await processBillAI(req.params.id, req.user.companyId);

    return res.status(200).json({
      success: true,
      message: "Bill fetched successfully",
      data: bill,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
