import bot from './assets/bot.svg'
import user from './assets/user.svg'

// the form is gotten using the tag name, because it is the only form in the document
const form=document.querySelector('form');

// the chat container is gotten using the ID
const chatContainer=document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
    element.textContent='';

    loadInterval=setInterval(()=> {
        element.textContent+='.';

        if (element.textContent==='....'){
            element.textContent=''; //reset the load interval
        }
    },300)
}

// this function is going to give the impression that the ai is typing the text.
function typeText(element,text){
    let index=0;

    let interval=setInterval(()=>{
        if (index<text.length){
            element.innerHTML+=text.charAt(index);
            index++;
        } else {
            clearInterval();
        }
    },20)
}

// Generate a unique id for a  single message to be able to map over
// this is done by using a combination of the current timestamp and date.
function generateUniqueId() {
    const timestamp=Date.now();
    const randomNumber=Math.random();
    const hexadecimalString=randomNumber.toString(16);// this is more random

    return `id-${timestamp}-${hexadecimalString}`
}

function chatStripe(isAi,value,uniqueId){
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img src="${isAi?bot:user}" alt="${isAi?'bot':'user'}"/>
                </div>
                <div class="message" id="${uniqueId}">${value}</div>
            </div>
        </div>
        `
    )
}

// Create a function to handle the submit and get the ai generated response.
//it takes event(e) as its parameter
const handleSubmit =async (e)=>{
    e.preventDefault();

    const data=new FormData(form);

    // generate user's chat stripe
    chatContainer.innerHTML+=chatStripe(false,data.get('prompt'));

    form.reset();

    // bot's chatstripe
    const uniqueId=generateUniqueId();
    chatContainer.innerHTML+=chatStripe(true,' ',uniqueId)

    chatContainer.scrollTop=chatContainer.scrollHeight;

    const messageDiv=document.getElementById(uniqueId);

    loader(messageDiv);

    //fetch data from the server -> bot's response
    const response=await fetch('https://code1-siml.onrender.com',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            prompt:data.get('prompt')
        })
    })

    clearInterval(loadInterval);
    messageDiv.innerHTML='';

    if (response.ok){
        const data =await response.json();
        const parsedData=data.bot.trim();

        typeText(messageDiv,parsedData);
    } else {
        const err=await response.text();

        messageDiv.innerHTML="Something went wrong!"
        alert(err);
    }
}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup',(e)=>{
    if(e.keyCode===13){
        handleSubmit(e);
    }
})

