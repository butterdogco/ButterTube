let currentVideoInfo;

const main = document.getElementById("main");
const videoPage = document.getElementById("videoPage");
const urlParams = new URLSearchParams(window.location.search);
const videoSearchParam = urlParams.get('video');
const channelSearchParam = urlParams.get('channel');
const searchParam = urlParams.get('search');
const websiteName = "YouTube Kids";

let searching = false;
let videoOpen = false;
let channelOpen = false;

function home() {
  document.title = websiteName;
  closeVideo();
  closeChannel();
  
  if (searching) {
    // document.getElementById("search").value = "";
    createVideos(_shuffledVideos);
    searching = false;
  }
  
  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({path:newurl},'',newurl);
  }
}

function search(query) {
  if (typeof(query) !== "string") {
    if (query.key !== "Enter") {
      return;
    } else {
      query = document.getElementById("search").value;
    }
  }
  
  home();
  searching = true;
  
  document.getElementById("videos").innerHTML = "";
  if (query === "") {
    home();
  } else {
    document.title = `${query} | Search | ${websiteName}`;
    
    _videos.forEach(function(item) {
      if (item.Title.toLowerCase().includes(query.toLowerCase()) || item.Creator.toLowerCase().includes(query.toLowerCase())) {
        let element = createVideoElement(item.Title, item.Creator, item.Thumbnail, _videos.indexOf(item));
        document.getElementById("videos").appendChild(element);
      }
    });
    
    if (history.pushState) {
      var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?search=${query}`;
      window.history.pushState({path:newurl},'',newurl);
    }
  }
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
      subscribed.forEach(function(item, index) {
      if (item === creatorName) {
        found = true;
      }
    });
    return found;
  }
}

function subscribe(username) {
  let button = document.getElementById("subscribe");
  if (getSubscribed(username) === true) {
    button.innerHTML = 'Subscribe';
    button.classList.remove("subscribed");
    
    let subbedTo = getSubscribed();
    subbedTo.splice(subbedTo.indexOf(username), 1);
    localStorage.setItem("subscribed", JSON.stringify(subbedTo));
  } else {
    button.innerHTML = 'Subscribed';
    button.classList.add("subscribed");
    
    let subbedTo = getSubscribed();
    subbedTo.push(username);
    localStorage.setItem("subscribed", JSON.stringify(subbedTo));
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
  
  document.title = `${title} | ${websiteName}`;
  
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
  const subscribeElement = document.getElementById("subscribe");
  if (getSubscribed(creator) === true) {
    subscribeElement.classList.add("subscribed");
    subscribeElement.innerText = "Subscribed";
  } else {
    if (subscribeElement.classList.contains("subscribed")) {
     subscribeElement.classList.remove("subscribed");
    }
    subscribeElement.innerText = "Subscribe";
  }
  subscribeElement.onclick = function() {
    subscribe(creator);
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
  document.title = `@${channelName} | ${websiteName}`;
  
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

function createAdElement(hint, image, link) {
  hint = hint || "";
  image = image || "";
  link = link || "";
  
  const a = document.createElement("a");
  a.classList.add("ad");
  a.title = hint;
  a.href = link;
  a.target = "_blank";
  const img = document.createElement("img");
  img.src = image;
  img.className = "thumbnail";
  img.onload = function(){
    img.style.opacity = 1;
  };
  a.appendChild(img);
  const p = document.createElement("p");
  p.innerText = "Advertisement";
  p.classList.add("desc");
  a.appendChild(p);
  
  return a;
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
  document.getElementById("videos").innerHTML = "";
  data.forEach(function(item, index) {
    if (!item.Ad) {
      let videoElement = createVideoElement(item.Title, item.Creator, item.Thumbnail, _videos.indexOf(item));
      document.getElementById("videos").appendChild(videoElement);
    } else {
      let adElement = createAdElement("ad",item.Image,item.Link);
      document.getElementById("videos").appendChild(adElement);
    }
  });
}

function readURL(returnHome) {
  if (videoSearchParam) {
    openVideo(Number(videoSearchParam));
  } else if (channelSearchParam) {
    openChannel(channelSearchParam);
  } else if (searchParam) {
    search(searchParam);
  } else if (returnHome) {
    home();
  }
}

window.addEventListener('popstate', () => {
  readURL(true);
});

document.addEventListener(
  "finished",
  (e) => {
    createVideos(_shuffledVideos);
    
    readURL(false);
  }
);