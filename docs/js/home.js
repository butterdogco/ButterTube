let currentVideoInfo;

const main = document.getElementById("main");
const videoPage = document.getElementById("videoPage");
const urlParams = new URLSearchParams(window.location.search);
const videoSearchParam = urlParams.get('video');
const channelSearchParam = urlParams.get('channel');
const websiteName = "YouTube Kids";

let videoOpen = false;
let channelOpen = false;

function logoClicked() {
  document.title = websiteName;
  closeVideo();
  closeChannel();
  
  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({path:newurl},'',newurl);
  }
}

function getSubscribed(creatorName) {
  let subscribed = localstorage.getItem("subscribed") || [];
  
  if (creatorName === undefined) {
    return subscribed;
  } else {
    let found = false;
    subscribed.forEach(function(item, index) {
      if (item === creatorName) {
        found = true;
      }
    });
    return found;
  }
}

function closeVideo() {
  videoOpen = false;
  const videoElement = document.getElementById("video");
  videoElement.pause();
  videoPage.style.transform = "translateY(100%)";
  const iframeElement = document.getElementById("iframe");
  iframeElement.src = "";
}

function openVideo(id) {
  videoOpen = true;
  videoPage.style.transform = "translateY(0%)";
  closeChannel();

  const videoInfo = _videos[id];
  const title = videoInfo.Title || "Video";
  const desc = videoInfo.Description || "No description";
  const creator = videoInfo.Creator || "User";
  const video = videoInfo.Video || "";
  
  document.title = title + ` | ${websiteName}`;
  
  currentVideoInfo = videoInfo;
  
  const titleElement = document.getElementById("videoTitle");
  titleElement.innerText = title;
  const descElement = document.getElementById("videoDesc");
  descElement.innerText = desc;
  const creatorElement = document.getElementById("videoCreator");
  creatorElement.innerText = creator;
  creatorElement.onclick = function() {
    openChannel(creator);
  };
  const iframeElement = document.getElementById("iframe");
  const videoElement = document.getElementById("video");
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
  
  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?video=${Number(id)}`;
    window.history.pushState({path:newurl},'',newurl);
  }
}

function closeChannel() {
  channelOpen = false;
  const videoElement = document.getElementById("video");
  if (videoElement) {
    videoElement.pause();
  }
  channelPage.style.transform = "translateY(100%)";
}

function openChannel(channelName) {
  const videosElement = document.getElementById("channelVideos");
  channelOpen = true;
  channelPage.style.transform = "translateY(0%)";
  document.getElementById("channelName").innerText = channelName;
  videosElement.innerHTML = "";
  document.title = "@" + channelName + ` | ${websiteName}`;
  
  _videos.forEach(function(item, index) {
    if (item.Creator === channelName) {
      let videoElement = createVideoElement(item.Title, item.Creator, item.Thumbnail, index);
      videosElement.appendChild(videoElement);
    }
  });
  
  if (videosElement.innerHTML !== "") {
    const notice = document.createElement("p");
    videosElement.appendChild(notice);
  }
  
  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?channel=${channelName}`;
    window.history.pushState({path:newurl},'',newurl);
  }
}

function subscribe(username) {
  let button = document.getElementById("subscribe");
  button.innerHTML = 'Subscribed';
  button.classList.add("subscribed");
}

function createVideoElement(title, creator, thumbnail, id) {
  title = title || "Video";
  creator = creator || "User";
  thumbnail = thumbnail || "https://raw.githubusercontent.com/butterdogco/butterdogco.github.io/main/docs/img/general/ayo.webp";
  id = id || 0;
  
  let div = document.createElement("div");
  div.classList.add("video");
  div.title = `Watch ${title}`;
  let img = document.createElement("img");
  img.className = "thumbnail";
  img.src = thumbnail;
  img.onload = function(){
    img.style.opacity = 1;
  };
  div.appendChild(img);
  let pTitle = document.createElement("p");
  pTitle.innerText = title;
  pTitle.className = "title";
  div.appendChild(pTitle);
  let pCreator = document.createElement("p");
  pCreator.innerText = "@" + creator;
  pCreator.className = "desc";
  pCreator.onclick = function() {
    openChannel(creator);
  };
  div.appendChild(pCreator);
  
  div.addEventListener("click", function() {
    openVideo(id);
  });
  
  return div;
}

function createVideos(data) {
  data.forEach(function(item, index) {
    let videoElement = createVideoElement(item.Title, item.Creator, item.Thumbnail, _videos.indexOf(item));
    document.getElementById("videos").appendChild(videoElement);
  });
}

document.addEventListener(
  "finished",
  (e) => {
    createVideos(_shuffledVideos);
    
    if (videoSearchParam) {
      openVideo(Number(videoSearchParam));
    } else if (channelSearchParam) {
      openChannel(channelSearchParam);
    }
  }
);