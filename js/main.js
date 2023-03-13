//import {getAccessToken} from './utilities.js';
let token;
const rootURL = 'https://photo-app-secured.herokuapp.com';
const username = "cameron";
const password = "cameron_password";

async function getAccessToken(rootURL, username, password) {
    const postData = {
        "username": username,
        "password": password
    };
    const endpoint = `${rootURL}/api/token/`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    });
    const data = await response.json();
    return data.access_token;
}

const showProfile = async () => {
    const endpoint = `${rootURL}/api/profile`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    console.log('Profile:', data);
    //Not the profile, but profile adjacent
    document.getElementById("main-buttons").insertAdjacentHTML('afterbegin', 
    `<button>${data.username}</button>`);
    document.getElementById("profile").insertAdjacentHTML('beforeend', 
    `<img src="${data.image_url}"><div>${data.username}</div>`)
}

const getSuggestions = async () => {
    const endpoint = `${rootURL}/api/suggestions`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Suggestions:', data);
    data.forEach(suggestionToHTML);
}

function suggestionToHTML (s) {
    document.getElementById("suggestions").insertAdjacentHTML('beforeend', 
    `<div>
        <img src="${s.image_url}">
        <div>
            <p class="suggestedName"><b>${s.username}</b></p>
            <p class="suggestion">suggested for you</p>
        </div>
        <button>follow</button>
    </div>`);
}

const getStories = async () => {
    const endpoint = `${rootURL}/api/stories`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Stories:', data);
    data.forEach(storyToHTML);
}

function storyToHTML (s) {
    document.querySelector(".stories").insertAdjacentHTML('beforeend', 
    `<div>
        <img src="${s.user.image_url}">
        <p>${s.user.username}</p>
    </div>`);
}

const getPosts = async () => {
    const endpoint = `${rootURL}/api/posts`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    //console.log('Posts:', data);
    const megastring = data.map(postToHTML).join('');
    document.querySelector(".news-feed").insertAdjacentHTML('beforeend', megastring);
}

function postToHTML (p, index) {
    if (index >= 10){
        return;
    }
    let comm = '';
    if ((p.comments) && (p.comments.length != 0)) {
        if (p.comments.length == 1){
            comm = `<p><b>${p.comments[0].user.username}</b> ${p.comments[0].text}</p>`;
        }else{
            comm = `<p><b>${p.comments[p.comments.length-1].user.username}</b> ${p.comments[p.comments.length-1].text}</p>`
            comm += `<button class="enterModal" onclick="enterModal(${p.id})">View all ${p.comments.length} comment(s)</button>`;
        }
    }
    return `<section id="post_${p.id}">
        <header>
            <p>${p.user.username}</p>
        </header>
        <img src="${p.image_url}">
        <div class="icons">
            <div>
                <button onclick="${(p.current_user_like_id) ? 'unlike('+p.id+', '+p.current_user_like_id+')"><i class="fa-solid' : 'like('+p.id+')"><i class="fa-regular'} fa-heart"></i></button>
                <button><i class="fa-regular fa-comment"></i></button>
                <button><i class="fa-regular fa-paper-plane"></i></button>
            </div>
            <button><i class="fa-${(p.current_user_bookmark_id) ? 'solid' : 'regular'} fa-bookmark"></i></button>
        </div>
        <div class="comments">
            <h2>${p.likes.length} likes</h2>
            <p><b>${p.user.username}</b> ${p.caption} <button><i class="fa-solid fa-ellipsis"></i></button></p>
            ${comm}
        </div>
    </section>`;
}

async function redrawPost(id){
    const endpoint = `${rootURL}/api/posts/${id}`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    //console.log('Post:', data);
    targetElementAndReplace(`#post_${id}`, postToHTML(data, 0));
}

async function like(id){
    const endpoint = `${rootURL}/api/posts/likes`;
    const postData = {
        "post_id": id
    };
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }, 
        body: JSON.stringify(postData)
    })
    const data = await response.json();
    redrawPost(id);
}

async function unlike(id, userId){
    const endpoint = `${rootURL}/api/posts/likes/${userId}`;
    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    //console.log(data);
    redrawPost(id);
}

function enterModal(id) {
    getComments(id);
    const modalElement = document.querySelector('.modal-bg');
    modalElement.classList.remove('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
    document.querySelector('.close').focus();
}

function exitModal(){
    const modalElement = document.querySelector('.modal-bg');
    modalElement.classList.add('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
}

async function getComments(id) {
    const endpoint = `${rootURL}/api/posts/${id}`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Post:', data);
    document.querySelector(".modal-body").innerHTML =
    `<img src="${data.image_url}">
    <div class="commenting">
        <div class="commentHead">
            <img src="${data.user.image_url}">
            <p>${data.user.username}</p>
        </div>
        <div class="commentTail"></div>
    </div>`;
    document.querySelector(".commentTail").innerHTML = '';
    data.comments.forEach(commentToHTML);
}

function commentToHTML (c) {
    document.querySelector(".commentTail").insertAdjacentHTML('beforeend', 
    `<p><b>${c.user.username}</b> ${c.text}</p>`);
}

const initPage = async () => {
    // first log in (we will build on this after Spring Break):
    token = await getAccessToken(rootURL, username, password);

    // then use the access token provided to access data on the user's behalf
    showProfile();
    getSuggestions();
    getStories();
    getPosts();
}

initPage();

const targetElementAndReplace = (selector, newHTML) => {
    const div = document.createElement('div'); 
    div.innerHTML = newHTML;
    const newEl = div.firstElementChild; 
    const oldEl = document.querySelector(selector);
    oldEl.parentElement.replaceChild(newEl, oldEl);
}