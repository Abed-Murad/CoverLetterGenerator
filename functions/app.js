const express = require('express');
const fetch = require('node-fetch');
const serverless = require('serverless-http');
const app = express();
const {JSDOM} = require('jsdom')

app.use(express.json());

const API_URL = 'https://api.openai.com/v1/completions';

async function askChatGPTToGenerateCoverACoverLetter(resumeText, jobUrl) {
    const cleanResume = resumeText.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
    const jobDescriptionText = await extractJobDescription(jobUrl);
    const cleanJobDescription = jobDescriptionText.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();

    const prompt = 'Start it with Dear..., My Name is Abed and Here is my Resume ' + cleanResume + '.\n Write a Cover Letter as If you where me for the position posted below.\n' + cleanJobDescription;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CHAT_GPT_KEY}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            temperature: 0.5,
            max_tokens: 1500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to call Chat GPT API');
    }

    const data = await response.json();
    return data.choices[0].text;
}

app.post('/api/v1/cover-letter', async (req, res) => {
    try {
        const { resumeText, jobUrl } = req.body;
        const coverLetter = await askChatGPTToGenerateCoverACoverLetter(resumeText, jobUrl);
        res.json({ coverLetter });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



async function extractJobDescription(url) {
    if (url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`An error occurred while fetching the URL: ${response.statusText}`);
            }
            const htmlContent = await response.text();
            const dom = new JSDOM(htmlContent);

            if (url.includes('linkedin.com')) {
                const jobDescriptionElement = dom.window.document.getElementById('job-details');
                if (jobDescriptionElement) {
                    return jobDescriptionElement.textContent;
                } else {
                    throw new Error('The element with the ID "job-details" was not found.');
                }
            }

            if (url.includes('join.com')){
                const jobDescriptionElement = dom.window.document.getElementById('about-job');
                if (jobDescriptionElement) {
                    return jobDescriptionElement.textContent;
                } else {
                    throw new Error('The element with the ID "job-description" was not found.');
                }
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
            throw error;
        }
    } else {
        throw new Error('Please enter a valid URL from LinkedIn or Join.');
    }
}


module.exports.handler = serverless(app);
