const main = document.getElementById("main");
const videoPage = document.getElementById("videoPage");

function logoClicked() {
  const videoElement = document.getElementById("video");
  videoElement.pause();
  videoPage.style.transform = "translateY(100%)";
}

function openVideo(id) {
  videoPage.style.transform = "translateY(0%)";

  const videoInfo = _videos[id];
  const title = videoInfo.Title;
  const desc = videoInfo.Description;
  const creator = videoInfo.Creator;
  const video = videoInfo.Video;
  
  const titleElement = document.getElementById("videoTitle");
  titleElement.innerText = title;
  const descElement = document.getElementById("videoDesc");
  descElement.innerText = desc;
  const creatorElement = document.getElementById("videoCreator");
  creatorElement.innerText = creator;
  const videoElement = document.getElementById("video");
  videoElement.src = video;
  videoElement.play();
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
  div.appendChild(img);
  let pTitle = document.createElement("p");
  pTitle.innerText = title;
  pTitle.className = "title";
  div.appendChild(pTitle);
  let pCreator = document.createElement("p");
  pCreator.innerText = creator;
  pCreator.className = "desc";
  div.appendChild(pCreator);
  
  div.addEventListener("click", function() {
    openVideo(id);
  });
  
  return div;
}

function createVideos(data) {
  data.forEach(function(item, index) {
    let videoElement = createVideoElement(item.Title, item.Creator, item.Thumbnail, index);
    document.getElementById("videos").appendChild(videoElement);
  });
}

document.addEventListener(
  "finished",
  (e) => {
    createVideos(_videos);
  }
);