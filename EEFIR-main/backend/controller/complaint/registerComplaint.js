const user = require("../../model/user");
const Complaint = require("../../model/complainant");
const personSchema = require("../../model/person");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEN_AI);

const generateSummary = async (data) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = JSON.stringify(data) + " generate a summary of the complaint in a short paragraph.";

    const result = await model.generateContent(prompt, { maxLength: 100 });
    const responseText = await result.response.text(); // Await the response text
    console.log(responseText);
    return responseText;
  } catch (err) {
    console.error("Error generating summary:", err);
    throw new Error("Failed to generate summary.");
  }
};

const getCategories = async (data) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const categories = [
      "Cognizable Offenses",
      "Non-Cognizable Offenses",
      "Bailable Offenses",
      "Non-Bailable Offenses",
      "Compoundable Offenses",
      "Non-Compoundable Offenses",
      "Offenses against Women",
      "Offenses against Children",
      "Economic Offenses",
      "Cyber Crimes",
      "Drug Offenses",
      "Environmental Offenses",
      "Traffic Offenses",
      "Property Offenses",
      "Terrorism-related Offenses",
      "White-collar Crimes",
      "Corruption Offenses",
      "Fraudulent Practices",
      "Domestic Violence Offenses",
      "Sexual Harassment Offenses",
      "Human Trafficking Offenses",
      "Intellectual Property Crimes",
      "Hate Crimes",
      "Juvenile Offenses",
      "Organized Crime",
      "Money Laundering Offenses",
      "Forgery and Counterfeiting Offenses",
      "Alcohol-related Offenses",
      "Public Order Offenses",
      "Violation of Intellectual Property Rights",
      "Cyberbullying Offenses",
      "Religious Offenses",
      "Wildlife Crimes",
      "Labour Law Violations",
      "Immigration Offenses"
    ];

    const prompt = JSON.stringify(data) + 
                   ' Identify and return the array of categories from the following list if they match: ' + 
                   JSON.stringify(categories) + 
                   '. If no matches are found, return ["Not Identified"].  remember i need strictly array nothing else';

    const result = await model.generateContent(prompt, { maxLength: 100 });
    const responseText = await result.response.text(); // Await the response text
    console.log(responseText);

    // Parse the response text into an array
    const identifiedCategories = JSON.parse(responseText);
    
    if (Array.isArray(identifiedCategories)) {
      return identifiedCategories.length > 0 ? identifiedCategories : ["Not Identified"];
    }
    
    return ["Not Identified"];
  } catch (err) {
    console.error("Error identifying categories:", err);
    throw new Error("Failed to identify categories.");
  }
};


exports.register = async (req, res) => {
  try {
    const { VictimArray, AccusedArray, WitnessArray, IncidentDetails, userId } =
      req.body;

    let Summary = "";
    let Categories = [];

    try {
      Summary = await generateSummary({
        VictimArray,
        AccusedArray,
        WitnessArray,
        IncidentDetails,
      });
    } catch (summaryErr) {
      console.error("Error generating summary:", summaryErr);
    }

    try {
      Categories = await getCategories({
        VictimArray,
        AccusedArray,
        WitnessArray,
        IncidentDetails,
      });
    } catch (categoriesErr) {
      console.error("Error getting categories:", categoriesErr);
    }

    const evidences = req.files
      ? Object.values(req.files).map((file) => file)
      : [];
    // console.log(123);
    // console.log(evidences);
    // console.log(evidences);

    const createPersonArray = async (personArray) => {
      const personIds = [];
      for (let personData of personArray) {
        personData = {
          ...personData,
          age: parseInt(personData.age),
          aadhar: parseInt(personData.aadhar),
          contact: parseInt(personData.contact),
        };

        const filteredPersonData = Object.fromEntries(
          Object.entries(personData).filter(([key, value]) => value)
        );

        console.log(filteredPersonData);
        const newPerson = new personSchema(filteredPersonData);
        await newPerson.save();
        personIds.push(newPerson._id);
      }
      return personIds;
    };

    const parsedVictimArray = JSON.parse(VictimArray);
    const parsedAccusedArray = JSON.parse(AccusedArray);
    const parsedWitnessArray = JSON.parse(WitnessArray);
    let parsedIncidentDetails = JSON.parse(IncidentDetails);
    console.log(parsedIncidentDetails);
    parsedIncidentDetails = {
      ...parsedIncidentDetails,
      TimeDateofIncident: new Date(parsedIncidentDetails.TimeDateofIncident),
    };

    const VictimIds = await createPersonArray(parsedVictimArray);
    const AccusedIds = await createPersonArray(parsedAccusedArray);
    const WitnessIds = await createPersonArray(parsedWitnessArray);

    const uploadedUrls = await Promise.all(
      evidences.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_large(
            file.tempFilePath,
            { resource_type: "auto" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                console.log(result);
                resolve(result.secure_url);
              }
            }
          );
        });
      })
    );

    console.log(uploadedUrls);

    let filedBy = null;
    console.log("userId", userId)
    if (userId) {
      filedBy = new mongoose.Types.ObjectId(userId);
    }

    let firId;
    let isUnique = false;

    while (!isUnique) {
      firId = Math.floor(Math.random() * 10000);
      const existingRecord = await Complaint.findOne({ firId });

      if (!existingRecord) {
        isUnique = true;
      }
    }

    const newComplaint = await Complaint.create({
      VictimIds: VictimIds.map((id) => new mongoose.Types.ObjectId(id)),
      AccusedIds: AccusedIds.map((id) => new mongoose.Types.ObjectId(id)),
      WitnessIds: WitnessIds.map((id) => new mongoose.Types.ObjectId(id)),
      IncidentDetail: parsedIncidentDetails,
      filedBy,
      Evidence: uploadedUrls,
      firId,
      Summary,
      Categories,
    });

    if (userId) {
      await user.updateOne(
        { _id: userId },
        {
          $addToSet: {
            filedComplaints: new mongoose.Types.ObjectId(newComplaint._id),
          },
        }
      );
    }

    console.log(newComplaint)

    res.status(200).json({
      message: "Complaint Filed Successfully",
      complaintId: newComplaint.firId,
    });
  } catch (err) {
    console.error("Error registering complaint:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const categories = [
  "Cognizable Offenses",
  "Non-Cognizable Offenses",
  "Bailable Offenses",
  "Non-Bailable Offenses",
  "Compoundable Offenses",
  "Non-Compoundable Offenses",
  "Offenses against Women",
  "Offenses against Children",
  "Economic Offenses",
  "Cyber Crimes",
  "Drug Offenses",
  "Environmental Offenses",
  "Traffic Offenses",
  "Property Offenses",
  "Terrorism-related Offenses",
  "White-collar Crimes",
  "Corruption Offenses",
  "Fraudulent Practices",
  "Domestic Violence Offenses",
  "Sexual Harassment Offenses",
  "Human Trafficking Offenses",
  "Intellectual Property Crimes",
  "Hate Crimes",
  "Juvenile Offenses",
  "Organized Crime",
  "Money Laundering Offenses",
  "Forgery and Counterfeiting Offenses",
  "Alcohol-related Offenses",
  "Public Order Offenses",
  "Violation of Intellectual Property Rights",
  "Cyberbullying Offenses",
  "Religious Offenses",
  "Wildlife Crimes",
  "Labour Law Violations",
  "Immigration Offenses",
  "Not Identified",
];
