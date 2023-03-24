const getJobDescription = document.getElementById('getJobDetails');

getJobDescription.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({target: { tabId: tab.id }, func: findJobDescription});
});

function findJobDescription() {
  const jobDetails = document.getElementById('job-details');
  if (jobDetails) {
    console.log(jobDetails.innerText);
    document.body.innerText = jobDetails.innerText;
  } else {
    document.body.innerText = 'Hey there';
  }
}
