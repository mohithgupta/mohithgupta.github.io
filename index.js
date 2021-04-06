AOS.init();

const menu = document.querySelector(".menu");
const navOpen = document.querySelector(".hamburger");
const navClose = document.querySelector(".close");
const navlinks = document.querySelectorAll(".scroll-link");
const nav_arr_length = navlinks.length;

function checkedWindowsize(){
  var navLeftwidth = menu.getBoundingClientRect().left;
navOpen.addEventListener("click", () => {
  
    menu.classList.add("show");
    
    for(var i=0;i<nav_arr_length;i++){
      navlinks[i].addEventListener("click",() => {
        menu.classList.remove("show")
      })
    }
});
navClose.addEventListener("click", () => {
    menu.classList.remove("show");
});
}

if(window.innerWidth<770){ // when opened directly in a small screen
checkedWindowsize();
}

window.addEventListener("resize",function(){ // when screen is resized
// console.log(window.innerWidth);
    if(window.innerWidth<770){
      // console.log("checked size");
  checkedWindowsize();
}
});



new TypeIt("#type1", {
  speed: 120,
  loop: true,
  waitUntilVisible: true,
})
  .type("I'm a Student", { delay: 400 })
  .pause(1000)
  .delete(20)
  .pause(10)
  .type("I love to Explore and Build", { delay: 400 })
  .pause(1000)
  .delete(20)
  .pause(10)
  .type("Web Dev", { delay: 400 })
  .pause(1000)
  .delete(20)
  .go();

new TypeIt("#type2", {
  speed: 120,
  loop: true,
  waitUntilVisible: true,
})

.type("Javascript...", { delay: 400 })
.pause(1000)
.delete(13)
.type("React...", { delay: 400 })
.pause(1000)
.delete(9)
.pause(10)
.type("CSS...", { delay: 400 })
.pause(1000)
.delete(9)
.pause(10)
.type("Git...", { delay: 400 })
.pause(1000)
.delete(9)
.type("learn quick.", { delay: 400 })
.pause(1000)
.delete(12)
.go();


gsap.from(".logo", { opacity: 0, duration: 1, delay: 0.5, y: -10 });
gsap.from(".hamburger", { opacity: 0, duration: 1, delay: 1, x: 20 });
gsap.from(".mypic", { opacity: 0, duration: 1, delay: 1.5, x: -200 });
gsap.from(".me p", { opacity: 0, duration: 1, delay: 2, y: -45 });
gsap.from(".me a", { opacity: 0, duration: 1, delay: 3, y: 50 });
gsap.from(".nav-item", {  opacity: 0,duration: 1,  delay: 1.2,y:30,  stagger: 0.2,});
gsap.from(".social-icons a", {   opacity: 0,  duration: 1,  delay: 1.2,  stagger: 0.2,});


window.addEventListener("DOMContentLoaded", function() {

    var form = document.getElementById("my-form");
    var button = document.getElementById("submit-button");
    var status = document.getElementById("my-form-status");

    function success() {
      form.reset();
      form.style = "display: none ";
      status.style="display:block";
      status.classList.add("status-success");
      setTimeout(function () {
        form.style = "display:block ";
        status.style="display:none";
        status.classList.remove("status-success");
      }, 10000);
    }

    function error() {
      form.reset();
      form.style = "display: none ";
      status.style.display="block";
      status.classList.add("status-error");
      setTimeout(function () {
        form.style = "display:block ";
        status.style="display:none";
        status.classList.remove("status-success");
      }, 10000);
    }

    form.addEventListener("submit", function(ev) {
      ev.preventDefault();
      var data = new FormData(form);
      ajax(form.method, form.action, data, success, error);
    });
  });

  function ajax(method, url, data, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;
      if (xhr.status === 200) {
        success(xhr.response, xhr.responseType);
      } else {
        error(xhr.status, xhr.response, xhr.responseType);
      }
    };
    xhr.send(data);
  }
