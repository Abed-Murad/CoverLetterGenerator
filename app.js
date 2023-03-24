// Create script elements for each external library
const jspdfScript = document.createElement('script');
jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.5/jspdf.debug.js';

const pdfjsScript = document.createElement('script');
pdfjsScript.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js';

const pdfmakeScript = document.createElement('script');
pdfmakeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.2/pdfmake.min.js';

const vfsFontsScript = document.createElement('script');
vfsFontsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/vfs_fonts.js';

// Append the script elements to the document's head section
document.head.appendChild(jspdfScript);
document.head.appendChild(pdfjsScript);
document.head.appendChild(pdfmakeScript);
document.head.appendChild(vfsFontsScript);


var resume = "Empty"
const loading = document.getElementById('loading');


document.getElementById('resume').addEventListener('change', async (event) => {
    const file = event.target.files[0];

    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const pdfData = new Uint8Array(e.target.result);
            resume = await extractTextFromPdf(pdfData)
            console.log(resume)
        };
        fileReader.readAsArrayBuffer(file);
    }
});



document.getElementById('generateCoverLetter').addEventListener('click', async () => {
    const urlInput = document.getElementById('jobUrl');
    const url = urlInput.value.trim();
    document.getElementById('coverLetter').value = await askChatGPTToGenerateCoverACoverLetter(resume, url)
});

document.getElementById('exportAsPDF').addEventListener('click',()=>{
    generatePDF(document.getElementById('coverLetter').value)

})


function generatePDF(text) {
    // Define the content of the PDF document
    var docDefinition = {
        pageSize: 'A4',
        content: [
            { text: text, fontSize: 12, margin: [0, 50, 0, 0] } // Add margin to the top
        ]
    };

    // Generate the PDF file using pdfmake
    pdfMake.createPdf(docDefinition).download("My Cover Letter");
}


async function extractTextFromPdf(pdfData) {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let extractedText = '';

    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
        const page = await pdf.getPage(pageIndex);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join('\n');
        extractedText += pageText + '\n';
    }

    return extractedText;
}


const API_URL = "https://aicoverlettergenerator.netlify.app/api/v1/cover-letter";
async function askChatGPTToGenerateCoverACoverLetter(resumeText , jobUrl) {
    loading.style.display = 'flex';

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resumeText: resumeText,
            jobUrl: jobUrl,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to call Chat GPT API");
    }

    const data = await response.json();
    const firstText = data.coverLetter;
    console.log(firstText);
    loading.style.display = 'none';
    return firstText;
}