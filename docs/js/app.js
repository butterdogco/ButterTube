import { videos, advertisements } from "./data.js";

const main = document.getElementById("main");
const sidebar = document.getElementById("sidebar");
const homeButton = document.getElementById("homeButton");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const logoImage = document.getElementById("logoImage");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const mobileSearchForm = document.getElementById("mobileSidebarSearchForm");
const mobileSearchInput = document.getElementById("mobileSidebarSearchInput");
const videosContainer = document.getElementById("videos");
const videoPage = document.getElementById("videoPage");
const videoElement = document.getElementById("video");
const iframeElement = document.getElementById("iframe");
const videoTitleElement = document.getElementById("videoTitle");
const videoDescElement = document.getElementById("videoDesc");
const videoCreatorElement = document.getElementById("videoCreator");
const subscribeButton = document.getElementById("subscribe");
const channelPage = document.getElementById("channelPage");
const channelNameHeader = document.getElementById("channelName");
const channelVideosContainer = document.getElementById("channelVideos");

const urlParams = new URLSearchParams(window.location.search);
const videoSearchParam = urlParams.get('video');
const channelSearchParam = urlParams.get('channel');
const searchParam = urlParams.get('search');
const websiteName = "ButterTube";
const apiUrl = "https://wikabedia-backend.fly.dev/get";

let currentVideoInfo;
let searching = false;
let videoOpen = false;
let channelOpen = false;
let loadedVideos = [...videos, ...advertisements];
let unshuffledVideoIds = loadedVideos.map((_, index) => index);

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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function getData() {
  const response = await fetch(apiUrl, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ sheet: 'YT_KIDS' })
  });

  if (!response.ok) {
    console.error('Error fetching videos:', response.statusText);
    return;
  }

  try {
    const responseJSON = await response.json();
    const { success, data } = responseJSON;
    if (!success) {
      throw new Error('Success was not true');
    }

    if (!data) {
      throw new Error('No data was received');
    }

    const formattedData = formatData(data);
    loadedVideos.push(...formattedData);
    loadedVideos = shuffleArray(loadedVideos);
    unshuffledVideoIds = loadedVideos.map((_, index) => index);
  } catch (error) {
    console.error('Error processing videos:', error);
  }
}

function formatData(data) {
  const formattedData = [];
  let articleCount = 0;

  for (let i = 0; i < data.length; i++) {
    const response = data[i];
    const responseNumber = i + 1; // add 1 to ignore header
    let imageURL = processDriveLink(response[3], true, false);

    if (response) {
      let image = response[6] || imageURL;
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
        Type: "video"
      };

      const approved = response[7] || "yes";
      if (approved === "yes") {
        formattedData.push(item);
      }
    }
  }

  return formattedData;
}

function setPageQueryParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({ path: url.toString() }, '', url.toString());
}

function goHome() {
  document.title = websiteName;
  closeVideo();
  closeChannel();

  if (searching) {
    createVideos(loadedVideos);
    searching = false;
  }

  if (history.pushState) {
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newurl }, '', newurl);
  }
}

function search(query) {
  goHome();
  searching = true;
  if (query === "") {
    return;
  }
  
  videosContainer.innerHTML = "";
  document.title = `${query} | Search | ${websiteName}`;

  const lowerCaseQuery = query.toLowerCase();
  const filteredVideos = loadedVideos.filter(item => {
    return item.Type != "ad" && (item.Title.toLowerCase().includes(lowerCaseQuery) || item.Creator.toLowerCase().includes(lowerCaseQuery));
  });
  console.log(filteredVideos);
  createVideos(filteredVideos);

  setPageQueryParam("search", query);
}

function getSubscribed(creatorName) {
  let subscribed;
  if (localStorage.getItem("subscribed")) {
    subscribed = JSON.parse(localStorage.getItem("subscribed"));
  } else {
    subscribed = [];
  }

  if (creatorName === undefined) {
    return subscribed;
  } else {
    let found = false;
    subscribed.forEach(function (item, index) {
      if (item === creatorName) {
        found = true;
      }
    });
    return found;
  }
}

function toggleSubscription(username) {
  if (getSubscribed(username) === true) {
    subscribeButton.innerHTML = 'Subscribe';
    subscribeButton.classList.remove("subscribed");

    let subbedTo = getSubscribed();
    subbedTo.splice(subbedTo.indexOf(username), 1);
    localStorage.setItem("subscribed", JSON.stringify(subbedTo));
  } else {
    subscribeButton.innerHTML = 'Subscribed';
    subscribeButton.classList.add("subscribed");

    let subbedTo = getSubscribed();
    subbedTo.push(username);
    localStorage.setItem("subscribed", JSON.stringify(subbedTo));
  }
}

function closeVideo() {
  if (!videoOpen) {
    return;
  }

  videoOpen = false;
  videoElement.pause();
  videoPage.style.transform = "translateY(100%)";
  iframeElement.src = "";
}

function openVideo(id) {
  videoOpen = true;
  videoPage.style.transform = "translateY(0%)";
  closeChannel();

  const videoInfo = loadedVideos[id];
  const title = videoInfo.Title || "Video";
  const desc = videoInfo.Description || "No description";
  const creator = videoInfo.Creator || "User";
  const video = videoInfo.Video || "";

  document.title = `${title} | ${websiteName}`;

  currentVideoInfo = videoInfo;

  videoTitleElement.innerText = title;
  videoDescElement.innerText = desc;
  videoCreatorElement.innerText = creator;
  videoCreatorElement.addEventListener("click", function () {
    openChannel(creator);
  });

  if (video.includes("drive.google.com")) {
    iframeElement.style.display = "block";
    videoElement.style.display = "none";
    iframeElement.src = video;
  } else {
    videoElement.style.display = "block";
    iframeElement.style.display = "none";
    videoElement.src = video;
    videoElement.play();
  }

  if (getSubscribed(creator) === true) {
    subscribeButton.classList.add("subscribed");
    subscribeButton.innerText = "Subscribed";
  } else {
    subscribeButton.classList.remove("subscribed");
    subscribeButton.innerText = "Subscribe";
  }
  subscribeButton.addEventListener("click", function () {
    toggleSubscription(creator);
  });

  setPageQueryParam("video", id);
}

function closeChannel() {
  channelOpen = false;
  videoElement.pause();
  channelPage.style.transform = "translateY(100%)";
}

function openChannel(channelName) {
  const videosElement = document.getElementById("channelVideos");
  channelOpen = true;
  channelPage.style.transform = "translateY(0%)";
  document.getElementById("channelName").innerText = channelName;
  videosElement.innerHTML = "";
  document.title = `@${channelName} | ${websiteName}`;

  loadedVideos.forEach(function (item, index) {
    if (item.Creator === channelName) {
      const videoElement = createVideoElement(item.Title, item.Creator, item.Thumbnail, index);
      videosElement.appendChild(videoElement);
    }
  });

  if (videosElement.innerHTML !== "") {
    const notice = document.createElement("p");
    videosElement.appendChild(notice);
  }

  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?channel=${channelName}`;
    window.history.pushState({ path: newurl }, '', newurl);
  }
}

function createAdElement(hint, image, link) {
  const a = document.createElement("a");
  a.classList.add("ad");
  a.title = hint;
  a.href = link;
  a.target = "_blank";

  const img = document.createElement("img");
  img.src = image;
  img.className = "thumbnail";
  img.setAttribute("loading", "lazy");
  img.addEventListener("load", function () {
    img.style.opacity = 1;
  }, { once: true });
  a.appendChild(img);

  const p = document.createElement("p");
  p.innerText = "Advertisement";
  p.classList.add("desc");
  a.appendChild(p);

  return a;
}

function createVideoElement(title, creator, thumbnail, id) {
  const div = document.createElement("div");
  div.classList.add("video");
  div.title = `Watch ${title}`;
  div.addEventListener("click", function () {
    openVideo(id);
  });

  const img = document.createElement("img");
  img.className = "thumbnail";
  img.src = thumbnail;
  img.setAttribute("loading", "lazy");
  img.addEventListener("load", function () {
    img.style.opacity = 1;
  }, { once: true });
  div.appendChild(img);

  const titleLabel = document.createElement("p");
  titleLabel.innerText = title;
  titleLabel.className = "title";
  div.appendChild(titleLabel);

  const creatorLabel = document.createElement("p");
  creatorLabel.innerText = "@" + creator;
  creatorLabel.className = "desc";
  creatorLabel.addEventListener("click", function (event) {
    event.stopPropagation();
    openChannel(creator);
  });
  div.appendChild(creatorLabel);

  return div;
}

function createVideos(data) {
  videosContainer.innerHTML = "";
  data.forEach(function (item, index) {
    if (item.Type != "ad") {
      const videoElement = createVideoElement(item.Title, item.Creator, item.Thumbnail, index);
      videosContainer.appendChild(videoElement);
    } else {
      const adElement = createAdElement("ad", item.Image, item.Link);
      videosContainer.appendChild(adElement);
    }
  });
}

function readURL(returnHome) {
  if (videoSearchParam) {
    openVideo(Number(videoSearchParam));
  } else if (channelSearchParam) {
    openChannel(channelSearchParam);
  } else if (searchParam) {
    onSearchInput(searchParam);
  } else if (returnHome) {
    goHome();
  }
}

function onMobileMenuButtonClick() {
  sidebar.classList.toggle("mobileActive");
}

homeButton.addEventListener("click", goHome);
mobileMenuButton.addEventListener("click", onMobileMenuButtonClick);
logoImage.addEventListener("click", goHome);
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  search(searchInput.value.trim());
});
mobileSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sidebar.classList.remove("mobileActive");
  search(mobileSearchInput.value.trim());
});
window.addEventListener('popstate', () => {
  readURL(true);
});
document.addEventListener("DOMContentLoaded", () => {
  getData().then(() => {
    createVideos(loadedVideos);
    readURL(false);
  });
});