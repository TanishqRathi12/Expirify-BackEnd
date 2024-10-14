const vision = require('@google-cloud/vision');
const path = require('path');
const { DateTime } = require('luxon');
const fs = require('fs');

// Initialize the Vision API client
const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, '')
});

// Parsing function to handle both numeric dates and "Month Year" formats
function parseDatesWithLogic(detectedText) {
    const dates = {};

    // Regex patterns for different date formats
    const numericDatePattern = /(\d{2}\/\d{2}\/\d{2}|\d{2}\/\d{2}\/\d{4})/g;
    const monthYearPattern = /([A-Za-z]{3}\.? \d{4})/g;

    // Find all date-like patterns in the text
    const numericDateMatches = detectedText.match(numericDatePattern) || [];
    const monthYearMatches = detectedText.match(monthYearPattern) || [];

    let parsedDates = [];

    // Process numeric dates (DD/MM/YY or DD/MM/YYYY)
    numericDateMatches.forEach((dateStr) => {
        try {
            let parsedDate;
            if (dateStr.split('/')[2].length === 2) {
                // DD/MM/YY
                parsedDate = DateTime.fromFormat(dateStr, 'dd/MM/yy').toJSDate();
            } else {
                // DD/MM/YYYY
                parsedDate = DateTime.fromFormat(dateStr, 'dd/MM/yyyy').toJSDate();
            }
            parsedDates.push(parsedDate);
        } catch (error) {
            console.log('Invalid date format:', dateStr);
        }
    });

    // Process "Month Year" dates (e.g., "JAN. 2024" or "DEC 2025")
    monthYearMatches.forEach((dateStr) => {
        try {
            const parsedDate = DateTime.fromFormat(dateStr.replace('.', ''), 'MMM yyyy').set({ day: 1 }).toJSDate();
            parsedDates.push(parsedDate);
        } catch (error) {
            console.log('Invalid month-year format:', dateStr);
        }
    });

    // Sort dates and assign MFG.DATE and EXP.DATE
    if (parsedDates.length >= 2) {
        const sortedDates = parsedDates.sort((a, b) => a - b);
        dates['MFG.DATE'] = sortedDates[0].toLocaleDateString('en-CA');  // Format: YYYY/MM/DD
        dates['EXP.DATE'] = sortedDates[1].toLocaleDateString('en-CA');  // Format: YYYY/MM/DD
    }

    return dates;
}

// Function to handle image processing and text detection
async function processImageAndExtractText(req, res) {
    try {
        const file = req; // Use the passed file object

        // Pass the image data buffer to the Vision API
        const [result] = await client.textDetection({ image: { content: file.data } });
        const detectedText = result.textAnnotations.length ? result.textAnnotations[0].description : '';

        if (detectedText) {
            const parsedDates = parseDatesWithLogic(detectedText);
            return parsedDates;

            // if (Object.keys(parsedDates).length > 0) {
            //     return res.status(200).json({ detectedText, parsedDates });
            // } else {
            //     return res.status(200).json({ detectedText, message: 'No valid dates found in the text.' });
            // }
        } else {
            return res.status(400).json({ message: 'No text detected in the image.' });
        }
    } catch (error) {
        console.error('Error processing the image:', error);
        return res.status(500).json({ message: 'Error processing the image.' });
    }
}


module.exports = { processImageAndExtractText };


