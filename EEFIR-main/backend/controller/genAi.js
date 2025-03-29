const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEN_AI);

exports.generateContent = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Updated model name
    //const prompt = req.body.prompt+=" if user ask any legal question about any incident he want to report it then give the response in three to four line template to describe the incident and if question is not valid then tell him to ask a legal question"|| "" ;
    const prompt = req.body.prompt 
    ? `${req.body.prompt} 

    Instruction: If the user asks a legal question related to an incident they want to report, generate a response in the form of a structured template. The template should describe the incident and include relevant IPC (Indian Penal Code) sections and related legal information. 

    Format:
    - **Incident Description:** [Summarize the reported incident]
    - **Applicable IPC Sections:** [List relevant sections]
    - **Legal Guidance:** [Provide an appropriate response based on legal context]
    - **Next Steps:** [Suggest actions the user can take]

    If the question is not legally valid, politely instruct the user to ask a clear legal question.`
    : "";

  
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const response = await result.response;
    const text =
      response.candidates[0]?.content?.parts[0]?.text || "No response generated.";

    res.json({ text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
