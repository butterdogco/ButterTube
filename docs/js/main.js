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
  {
    Title:"INTROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    Description:"WELCOME TO SUS STUDIOS MAKE SURE TO LIKE AND SUBSCRIBE",
    Creator:"SUS STUDIOS",
    Thumbnail:"https://github.com/butterdogco/butterdogco.github.io/blob/main/docs/img/SUS%20STUDIOS%20INTRO%20THUMBNAIL.png?raw=true",
    Video:"https://github.com/butterdogco/butterdogco.github.io/raw/main/docs/videos/SUS Studios Intro.mp4"
  },
  {
    Title:"Digital HiTech Presentation",
    Description:"Technology",
    Creator:"Renderforest",
    Thumbnail:"https://github.com/butterdogco/butterdogco.github.io/blob/main/docs/img/presentation%20thumbnail.png?raw=true",
    Video:"https://github.com/butterdogco/butterdogco.github.io/raw/main/docs/videos/Digital HiTech Presentation_free.mp4"
  }
];

function processDriveLink(url, makeLink, video) {
  makeLink = makeLink || true;
  video = video || false;
  let newURL = url;
  if (newURL.includes("drive.google.com")) {
    // is google drive
    newURL = newURL.replace('https://drive.google.com/open?id=', '');
    if (makeLink === true) {
      if (video) {
        newURL = `https://drive.google.com/file/d/${newURL}/preview`;
      } else if (!newURL.includes("https://drive.google.com/thumbnail?id=")) {
        newURL = `https://drive.google.com/thumbnail?id=${newURL}`;
      }
    }
  }
  return newURL;
}

function getData() {
  /*
  document.dispatchEvent(finished);
  return;
    */
  
  const spreadsheetId = "1LlL8mrSXTTV6qHOkUKd57oVb0uZATq037Wg4ltlDreg";
  const sheetName = "Form Responses 3";
  const sheetId = "AIzaSyBie4PasgrxYkF7LRl8zcCGUsnBnwZ8pWE";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${sheetId}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data) {
        const responseData = formatData(data);
        _videos.push(...responseData);
        done = true;
        document.dispatchEvent(finished);
      }
    })
    .catch(error => console.error(error));
}

function formatData(data) {
  const formattedData = [];
  var articleCount = 0;
  
  for (let i = 1; i < data.values.length; i++) {
    const response = data.values[i];
    const responseNumber = i + 1; // add 1 to ignore header
    var imageURL = processDriveLink(response[3], true, false);

    if (response) {
      var image = response[6] || imageURL;
      if (image.includes("https://")) {
        // is a web url
        image = processDriveLink(image.toString(), true);
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
        Video: processDriveLink(response[3], true, true),
      };
      
      let approved = response[7] || "yes";
      if (approved === "yes") {
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