// const vision = require('@google-cloud/vision');
// const path = require('path');
// const { DateTime } = require('luxon');
// const fs = require('fs');

// // Initialize the Vision API client
// const client = new vision.ImageAnnotatorClient({
//     keyFilename: path.join(__dirname, 'southern-ivy-438013-m1-8c8da6fccc17.json')
// });

// // Parsing function to handle both numeric dates and "Month Year" formats
// function parseDatesWithLogic(detectedText) {
//     const dates = {};

//     // Regex patterns for different date formats
//     const numericDatePattern = /(\d{2}\/\d{2}\/\d{2}|\d{2}\/\d{2}\/\d{4})/g;
//     const monthYearPattern = /([A-Za-z]{3}\.? \d{4})/g;

//     // Find all date-like patterns in the text
//     const numericDateMatches = detectedText.match(numericDatePattern) || [];
//     const monthYearMatches = detectedText.match(monthYearPattern) || [];

//     let parsedDates = [];

//     // Process numeric dates (DD/MM/YY or DD/MM/YYYY)
//     numericDateMatches.forEach((dateStr) => {
//         try {
//             let parsedDate;
//             if (dateStr.split('/')[2].length === 2) {
//                 // DD/MM/YY
//                 parsedDate = DateTime.fromFormat(dateStr, 'dd/MM/yy').toJSDate();
//             } else {
//                 // DD/MM/YYYY
//                 parsedDate = DateTime.fromFormat(dateStr, 'dd/MM/yyyy').toJSDate();
//             }
//             parsedDates.push(parsedDate);
//         } catch (error) {
//             console.log('Invalid date format:', dateStr);
//         }
//     });

//     // Process "Month Year" dates (e.g., "JAN. 2024" or "DEC 2025")
//     monthYearMatches.forEach((dateStr) => {
//         try {
//             const parsedDate = DateTime.fromFormat(dateStr.replace('.', ''), 'MMM yyyy').set({ day: 1 }).toJSDate();
//             parsedDates.push(parsedDate);
//         } catch (error) {
//             console.log('Invalid month-year format:', dateStr);
//         }
//     });

//     // Sort dates and assign MFG.DATE and EXP.DATE
//     if (parsedDates.length >= 2) {
//         const sortedDates = parsedDates.sort((a, b) => a - b);
//         dates['MFG.DATE'] = sortedDates[0].toLocaleDateString('en-CA');  // Format: YYYY/MM/DD
//         dates['EXP.DATE'] = sortedDates[1].toLocaleDateString('en-CA');  // Format: YYYY/MM/DD
//     }

//     return dates;
// }

// // Function to handle image processing and text detection
// async function processImageAndExtractText(req, res) {
//     try {
//         const file = req; // Use the passed file object

//         // Pass the image data buffer to the Vision API
//         const [result] = await client.textDetection({ image: { content: file.data } });
//         const detectedText = result.textAnnotations.length ? result.textAnnotations[0].description : '';

//         if (detectedText) {
//             const parsedDates = parseDatesWithLogic(detectedText);
//             return parsedDates;

//             // if (Object.keys(parsedDates).length > 0) {
//             //     return res.status(200).json({ detectedText, parsedDates });
//             // } else {
//             //     return res.status(200).json({ detectedText, message: 'No valid dates found in the text.' });
//             // }
//         } else {
//             return res.status(400).json({ message: 'No text detected in the image.' });
//         }
//     } catch (error) {
//         console.error('Error processing the image:', error);
//         return res.status(500).json({ message: 'Error processing the image.' });
//     }
// }


// module.exports = { processImageAndExtractText };


const vision = require('@google-cloud/vision');
const path = require('path');
const { DateTime } = require('luxon');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp'); // For image processing
const fs = require('fs');
require('dotenv').config();

// Initialize the Vision API client
const client = new vision.ImageAnnotatorClient({
    credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
    },
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
            if (dateStr.split('/')[2].length === 2) {
                // DD/MM/YY
                parsedDates.push(DateTime.fromFormat(dateStr, 'dd/MM/yy').toJSDate());
            } else {
                // DD/MM/YYYY
                parsedDates.push(DateTime.fromFormat(dateStr, 'dd/MM/yyyy').toJSDate());
            }
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
        dates['MFG.DATE'] = DateTime.fromJSDate(sortedDates[0]).toFormat('yyyy/MM/dd');
        dates['EXP.DATE'] = DateTime.fromJSDate(sortedDates[1]).toFormat('yyyy/MM/dd');
    }

    return dates;
}





// Function to handle image processing, text detection, and product name extraction
async function processImageAndExtractText(file) {
    try {
        // Perform text detection on the uploaded image
        const [result] = await client.textDetection({ image: { content: file.data } });
        const detectedText = result.textAnnotations.length ? result.textAnnotations[0].description : '';

        if (!detectedText) {
            // If no text is detected, return an error message
            return { error: 'No text detected in the image.' };
        }

        // Extract the text annotations
        const textAnnotations = result.textAnnotations;
        let productName = '';
        let largestArea = 0;

        // Loop through detected text annotations to find the most likely product name
        for (let i = 1; i < textAnnotations.length; i++) {
            const annotation = textAnnotations[i];
            const vertices = annotation.boundingPoly.vertices;

            // Calculate the bounding box area
            const width = Math.abs(vertices[1].x - vertices[0].x);
            const height = Math.abs(vertices[2].y - vertices[0].y);
            const area = width * height;

            // Identify text near the top of the image with the largest area as the product name
            const yPosition = vertices[0].y;
            if (yPosition < 0.25 * textAnnotations[0].boundingPoly.vertices[2].y && area > largestArea && annotation.description.length > 3) {
                productName = annotation.description;
                largestArea = area;
            }
        }

        // Parse dates from the detected text
        const parsedDates = parseDatesWithLogic(detectedText);

        // Further refine dates by checking smaller texts near the bottom of the image
        let likelyDateTexts = [];
        for (let i = 1; i < textAnnotations.length; i++) {
            const annotation = textAnnotations[i];
            const vertices = annotation.boundingPoly.vertices;
            const width = Math.abs(vertices[1].x - vertices[0].x);
            const height = Math.abs(vertices[2].y - vertices[0].y);

            // Consider text elements near the bottom of the image as potential dates
            if (height < width && vertices[0].y > 0.6 * textAnnotations[0].boundingPoly.vertices[2].y) {
                likelyDateTexts.push(annotation.description);
            }
        }

        // Parse dates from these likely date texts and merge with the initial parsed dates
        likelyDateTexts.forEach(text => {
            const datesFromText = parseDatesWithLogic(text);
            if (Object.keys(datesFromText).length > 0) {
                parsedDates['MFG.DATE'] = datesFromText['MFG.DATE'] || parsedDates['MFG.DATE'];
                parsedDates['EXP.DATE'] = datesFromText['EXP.DATE'] || parsedDates['EXP.DATE'];
            }
        });

        const product_name = productName || 'Unknown Product';

        // Return the extracted data
        return { product_name, parsedDates };
    } catch (error) {
        console.error('Error processing the image:', error);
        return { error: 'Error processing the image.' };
    }
}

module.exports = { processImageAndExtractText };


