import {
    getDashboardSummary,
    getMonthlyCarbonTrend,
    getUtilityDistribution,
    getFacilityEmissions,
    getRecentBills
} from "../services/dashboardService.js";

export const dashboardSummary = async (req, res) => {

    try {

        const data = await getDashboardSummary(
            req.user.companyId
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const monthlyCarbonTrend = async (req, res) => {

    try {

        const data = await getMonthlyCarbonTrend(
            req.user.companyId
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const utilityDistribution = async (req, res) => {

    try {

        const data = await getUtilityDistribution(
            req.user.companyId
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const facilityEmissions = async (req, res) => {

    try {

        const data = await getFacilityEmissions(
            req.user.companyId
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const recentBills = async (req, res) => {

    try {

        const data = await getRecentBills(
            req.user.companyId
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};