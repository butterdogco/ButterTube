const finished = new Event("finished");
let done = false;

let _videos = [
  {
    Title:"SLOW DOWN!",
    Description:"MINECRAFT LET'S PLAY",
    Creator:"Beaverton School District",
    Thumbnail:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRRakK8jdJdfrdQaIWzPM6YllwG0ZPIcb46oQVnY6T&s",
    Video:"https://github.com/butterdogco/butterdogco.github.io/raw/main/docs/videos/slow%20down%20-%20youtube%20kids.mp4"
  },
  {
    Title:"Introducing: Boogle Brome",
    Description:"HELO",
    Creator:"Boogle",
    Thumbnail:"https://github.com/butterdogco/butterdogco.github.io/blob/main/docs/img/boogle%20brome%20video%20thumbnail.png?raw=true",
    Video:"https://github.com/butterdogco/butterdogco.github.io/raw/main/docs/videos/advertise.mp4"
  },
];

function processDriveLink(url) {
  let newURL = url;
  if (newURL.includes("drive.google.com")) {
    // is google drive
    const driveId = response[5].toString().replace('https://drive.google.com/open?id=', '');
    const newDriveURL = `https://drive.google.com/thumbnail?id=${driveId}`;
    newURL = newImageUrl;
  } else {
    // is a regular web url
  }
  return newURL;
}

function getData() {
  document.dispatchEvent(finished);
  return;
  
  const spreadsheetId = "18fBvUB7EX17xC9-GEodixsVfd2W0spWbeskQsZZNIhI";
  const sheetName = "Form Responses 1";
  const sheetId = "AIzaSyBie4PasgrxYkF7LRl8zcCGUsnBnwZ8pWE";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${sheetId}`;

  fetch(url)
    .then(response => response.json())
    .then(dat => {
      if (dat) {
        const responseData = formatData(dat);
        _videos.push(...responseData);
        done = true;
        document.dispatchEvent(finished);
      }
    })
    .catch(error => console.error(error));
}

function formatData(dat) {
  const formattedData = [];
  var articleCount = 0;

  for (let i = 1; i < dat.values.length; i++) {
    const response = dat.values[i];
    const responseNumber = i + 1; // add 1 to ignore header
    var imageURL = "img/placeholder thumbnail.png";

    if (response) {
      var image = response[6] || imageURL;
      if (image.includes("https://")) {
        // is a web url
        image = processDriveLink(image);
      } else {
        // is a local url so remove ../
        image = image.replace(/\.\.\//i, "");
      }

      // increase the video count
      if (responseNumber > articleCount) {
        articleCount = responseNumber;
      }

      const item = {
        Title: response[4],
        Description: response[5],
        Creator: response[2],
        Thumbnail: image,
        Video: image,
      };
      
      let approved = response[7];
      if (approved) {
        formattedData.push(item);
      }
    }
  }

  return formattedData;
}

getData();

// 0|A = date made
// 1|B = email
// 2|C = creator
// 3|D = video link (unprocessed)
// 4|E = video title
// 5|F = video desc
// 6|G = video thumbnail (unprocessed)
// 7|H = approved