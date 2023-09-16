import { PdfReader } from "pdfreader";
import fetch from "node-fetch";


function ensureJson(variable) {
    if (typeof variable === 'string') {
        try {
            return JSON.parse(variable);
        } catch (error) {
            // If parsing fails, return the original value
            return variable;
        }
    } else if (typeof variable === 'object') {
        // If it's already an object, return it as is
        return variable;
    } else {
        // For other data types, return null or handle as needed
        return null;
    }
}



const extractPdfText = (filePath) => {
    return new Promise(async (resolve, reject) => {
        let extractedText = '';

        const pdfReader = new PdfReader();

        pdfReader.parseFileItems(filePath, (err, item) => {
            if (err) {
                reject(err);
            } else if (!item) {
                // End of the PDF file
                resolve(extractedText);
            } else if (item.text) {
                extractedText += item.text;
            }
        });
    });
};

// Define the function that will receive the extracted text
const processExtractedText = async (text) => {
    console.log("Checking");
    // Rest of your code for processing the extracted text here
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'system', content: 'You are a job recruiter that extracts important information from a resume regarding skills, projects, experience, certifications etc.' }, { role: "user", content:`Analyse the subsequent resume data and make an elevator pitch in first person to a working professional whom you would like to give you a referral. Also extract all the technical skills from the resume. Only return the output as JSON code and the elevator pitch under message, and the skills as a list under skills. Resume: ${text}`}],
            temperature: 0.7,
            max_tokens: 600
        })
    }
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        //console.log(data.choices[0].message.content);
        return ensureJson(data.choices[0].message.content);
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
};

const filePath = "C:/Users/abhin/OneDrive/Desktop/Projects/shellhax2023/client/src/JobSeeker/resume10.pdf";

// Use async/await to ensure the PDF text extraction completes before processing
(async () => {
    try {
        const extractedText = await extractPdfText(filePath);
        //console.log("PDF text extracted successfully:");
        //console.log(extractedText);

        // Pass the extracted text to the processExtractedText function
        const jsonoutput = await processExtractedText(extractedText);
        //console.log(jsonoutput);
    } catch (error) {
        console.error("Error extracting PDF text:", error);
    }
})();
