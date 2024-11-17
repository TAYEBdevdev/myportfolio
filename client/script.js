let TP = [];

// Function to get all TP data
const getTP = () => {
  axios.get('https://myportfolio-yw6m.onrender.com/getallTP')
    .then((res) => {
      TP = res.data.TP;
      console.log(TP);
      displayTP(); // Call function to display the TP items
    })
    .catch((error) => {
      console.error('Error fetching data:', error); // Log any errors
    });
};

// Function to display TP list in the frontend
const displayTP = () => {
  const tpList = document.getElementById('tp-list');
  tpList.innerHTML = ''; // Clear any existing items

  TP.forEach((item) => {
    // Create a div container for each TP item
    const tpItem = document.createElement('div');
    tpItem.className = 'tp-item';

    // Create a span for the item name
    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.name; // Adjust based on item properties
    tpItem.appendChild(nameSpan);

    // Create the download button
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.className = 'download-btn';

    // Set the download action for the button
    downloadButton.addEventListener('click', () => {
      axios.get(`https://myportfolio-yw6m.onrender.com/downloadfile/67365d78657f5769a6725a8d`, { responseType: 'blob' })
        .then(res => {
          // Create a blob from the response data
          const blob = new Blob([res.data], { type: res.headers['content-type'] });
          const link = document.createElement("a");

          // Create a URL for the blob and set it as the href
          link.href = window.URL.createObjectURL(blob);
          link.download = `${item.name}`; // Set a filename for download

          // Append the link to the body (necessary for Firefox)
          document.body.appendChild(link);
          link.click(); // Simulate a click on the link to start the download

          // Clean up by removing the link and revoking the object URL
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch(error => {
          console.error('Download error:', error); // Improved error logging
        });
    });

    // Append the button to the TP item
    tpItem.appendChild(downloadButton);

    // Append the TP item to the tp-list container
    tpList.appendChild(tpItem);
  });
};

// Call the function
getTP();
