import { PdfReader } from "pdfreader";
import fetch from "node-fetch";
const API_KEY = "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";

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
            messages: [{ role: 'system', content: 'You are a job recruiter that extracts important information from a resume regarding skills, projects, experience, certifications etc.' }, { role: "user", content:`extract all important information such as experience, projects, certifications, skills etc. as a paragraph from my perspective for a recruiter in first person as I am writing it from this resume${text}`}],
            temperature: 0.7,
            max_tokens: 600
        })
    }
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        console.log(data.choices[0].message.content);
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
        console.log("PDF text extracted successfully:");
        console.log(extractedText);

        // Pass the extracted text to the processExtractedText function
        await processExtractedText(extractedText);
    } catch (error) {
        console.error("Error extracting PDF text:", error);
    }
})();