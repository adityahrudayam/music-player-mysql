const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');
const setbtn = document.getElementById('setbtn');
const audioTrack = document.getElementById('music');
const repeatEl = document.getElementById('repeatTimes');
// const searchEl = document.getElementById('filter');
let count = 0;

// x.addEventListener("keydown", ());

// function search(){
//   const filtStr = searchEl.value.trim();
//   fetch('http://localhost:3000/filter', {

//   });
// }

if (repeatEl || audioTrack) {
  audioTrack.controls = true;
  audioTrack.loop = false;
  audioTrack.addEventListener('ended', (event) => {
    console.log(audioTrack);
    count += 1;
    if (count >= repeatEl.value) {
      audioTrack.pause();
      count = 0;
    } else {
      audioTrack.play();
    }
  });
}

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);
