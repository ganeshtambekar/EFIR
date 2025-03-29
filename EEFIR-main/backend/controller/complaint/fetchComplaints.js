const User = require("../../model/user");
const Complaint = require("../../model/complainant");
const personSchema = require("../../model/person");
const mongoose = require("mongoose");

exports.fetchComplaint = async (req, res) => {
  try {
    // console.log(123);
    const firId = req.params.firId;

    console.log(req.params.firId);

    if (firId) {
      const fir = await Complaint.findOne({ firId }).populate({
        path: "VictimIds AccusedIds WitnessIds filedBy",
      });

      if (!fir) {
        return res.status(401).json({ message: "FIR not found" });
      }

      return res.status(200).json({ fir: [fir] });
    }

    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const userReq = await User.findById(userId).populate({
      path: "filedComplaints",
      populate: {
        path: "VictimIds AccusedIds WitnessIds filedBy",
      },
    });

    if (!userReq) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ fir: userReq.filedComplaints });
  } catch (err) {
    console.error("Error fetching complaint:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.fetchComplaintSuper = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    const userId = req.params.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser = await User.findById(userId);

    if (req.query.fromDateIncident && req.query.toDateIncident) {
      filter["IncidentDetail.TimeDateofIncident"] = {
        $gte: new Date(req.query.fromDateIncident),
        $lte: new Date(req.query.toDateIncident),
      };
    }

    if (req.query.fromDateLastEdited && req.query.toDateLastEdited) {
      filter["LastEdited"] = {
        $gte: new Date(req.query.fromDateLastEdited),
        $lte: new Date(req.query.toDateLastEdited) || new Date.now(),
      };
    }

    if (req.query.district) {
      filter["IncidentDetail.District"] = req.query.district;
    }

    if (req.query.subDistrict) {
      filter["IncidentDetail.SubDistrict"] = req.query.subDistrict;
    }

    if (req.query.Categories) {
      filter["Categories"] = { $in: req.query.Categories };
    }

    if (req.query.aadhar) {
      const person = await personSchema.findOne({ aadhar: req.query.aadhar });
      if (person) {
        filter["$or"] = [
          { VictimIds: { $elemMatch: { $eq: person._id } } },
          { AccusedIds: { $elemMatch: { $eq: person._id } } },
          { WitnessIds: { $elemMatch: { $eq: person._id } } },
        ];
      }
    }

    if (req.query.status) {
      filter["complaintStatus.status"] = req.query.status;
    }

    if (req.query.uniqueUserId) {
      filter["complaintStatus.uniqueUserId"] = {
        $regex: `^${req.query.uniqueUserId}`,
        $options: "i",
      };
    }

    // Handling areaD and areaSubD
    let allowedDistricts = req.query.areaD ? req.query.areaD.split(",") : [];
    let allowedSubDistricts = req.query.areaSubD ? req.query.areaSubD.split(",") : [];

    // if (allowedDistricts.length > 0) {
    //   filter["IncidentDetail.District"] = { $in: allowedDistricts };
    // }

    if (allowedSubDistricts.length > 0) {
      filter["IncidentDetail.SubDistrict"] = { $in: allowedSubDistricts };
    }

    if (req.query.district && allowedDistricts.length > 0) {
      if (!allowedDistricts.includes(req.query.district)) {
        return res.status(403).json({ message: "Unauthorized district access" });
      }
    }

    if (req.query.subDistrict && allowedSubDistricts.length > 0) {
      if (!allowedSubDistricts.includes(req.query.subDistrict)) {
        return res.status(403).json({ message: "Unauthorized sub-district access" });
      }
    }

    console.log(filter);

    const complaints = await Complaint.find(filter)
      .sort({ LastEdited: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "VictimIds AccusedIds WitnessIds filedBy complaintStatus.user",
      });

    const totalComplaints = await Complaint.countDocuments(filter);

    res.status(200).json({
      complaints,
      currentPage: page,
      totalPages: Math.ceil(totalComplaints / limit),
    });
  } catch (err) {
    console.error("Error fetching complaint:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
