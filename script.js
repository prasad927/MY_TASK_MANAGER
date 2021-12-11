'use strict';

const addBtn = document.querySelector('.add-btn');
const removeBtn = document.querySelector('.remove-btn');

//for modal.
const modalCont = document.querySelector('.modal-cont');
const mainCont = document.querySelector('.main-cont');
const textAreaCont = document.querySelector('.textarea-cont');
const allPriorityColors = document.querySelectorAll('.priority-color');


const colors = ['lightpink','lightblue','lightgreen','black'];
let modalPriorityColor = colors[colors.length-1];

let ticketsArray = [];

const toolBoxColors = document.querySelectorAll('.color');


// use for toggling.
let addFlag=false;
let removeFlag=false;

let lockClass = 'fa-lock';
let unlockClass = 'fa-lock-open';


//mine-local storage first on application starts
if(localStorage.getItem('jira_tickets')){
    //retrive and display tickets.
    ticketsArray = JSON.parse(localStorage.getItem('jira_tickets')); //parse to array
    ticketsArray.forEach(function(ticketObj){
        const {ticketColor,ticketId,ticketTask} = ticketObj;
        createTicket(ticketColor,ticketId,ticketTask);
    });
}

//get idx of ticket
function getTicketIdx(id){
    let ticketIdx = ticketsArray.findIndex(function(ticketObj){
        return ticketObj.ticketId===id;
    });

    return ticketIdx;
}


//add functionality
addBtn.addEventListener('click',function(e){
    console.log('clickedddddd');
    //create/Display modal
    //addFlag=true :display-->modal
    //addFlag=false :hide-->modal
    addFlag = !addFlag; //for toggle
    
    if(addFlag){
        modalCont.style.display ='flex';
    }else{
        modalCont.style.display ='none';
    }

    //generate-Ticket
});

const setModalToDefault = function(){
    
    //hide modal-cont
    modalCont.style.display ='none';
    textAreaCont.value = ''; //replace old sentence with '';
    allPriorityColors.forEach(function(prioColorElm,idx){
        prioColorElm.classList.remove('border');
    });
    //add border on black color
    allPriorityColors[allPriorityColors.length-1].classList.add('border');
    modalPriorityColor = colors[colors.length-1]; //default.
}

//addEventListener on modal container when
modalCont.addEventListener('keydown',function(e){
    const key = e.key;

    if(key==='Shift'){
        //create-ticket
        createTicket(modalPriorityColor,undefined,textAreaCont.value);
        addFlag=false;
        setModalToDefault();
    }
});

//addevent listerner on prioritycolor /for modal priority coloring
allPriorityColors.forEach(function(colorElm,idx){
    //adding event listener
    colorElm.addEventListener('click',function(e){

        //remove orders on other colors/preveously clicked color
        allPriorityColors.forEach(function(prioColorElm,idx){
            prioColorElm.classList.remove('border');
        });

        //and add border on clicked color.
        colorElm.classList.add('border');
        modalPriorityColor = colorElm.classList[0]; // for color
    });
});  


// ticket create
function createTicket(ticketColor,ticketId,ticketTask){

    const id = ticketId  || shortid(); //for handle duplicates
      
    let ticketCont = document.createElement('div');
    ticketCont.setAttribute('class','ticket-cont');
    ticketCont.innerHTML = `<div class="ticket-color ${ticketColor}"></div>
                            <div class="ticket-id">$${id}</div>
                            <div class="task-area">${ticketTask}</div>
                            <div class="ticket-lock">
                                  <i class="fas fa-lock"></i>
                            </div>
                            `;

    mainCont.appendChild(ticketCont);

    // IMP POINT CODE.
    if(ticketId===undefined){
        //means fun. called on modal removal.(new ticket generated)
        ticketsArray.push({ticketColor,ticketId:id,ticketTask});

        //addTolocal storage
        localStorage.setItem('jira_tickets',JSON.stringify(ticketsArray));
    }

    //remove tickets on click on cross btn functionality
    handleRemoval(ticketCont,id);

    //bacause lock-ticket generate hoga tabhi available hoga pehle nahi
    handleLock(ticketCont,id);

    handleTicketColorOnClick(ticketCont,id);
}

//cross btn click functionality
removeBtn.addEventListener('click',function(e){
    //toggle removeFlag
    removeFlag = !removeFlag;
});


//remove tickets on click on cross btn functionality
function handleRemoval(ticket,id){
     
    ticket.addEventListener('click',function(e){
        if(removeFlag){
            ticket.remove(); //remove on UI

            //remove ticket form array (from storage.)
            const ticketIdx = getTicketIdx(id);
            ticketsArray.splice(ticketIdx,1);

            localStorage.setItem('jira_tickets',JSON.stringify(ticketsArray));
        }
    });
}


function handleLock(ticket,id){
    const ticketLockElm = ticket.querySelector('.ticket-lock');
    const ticketLock = ticketLockElm.children[0];

    const ticketTaskArea = ticket.querySelector('.task-area');

    //addEventListener of ticketlock
    ticketLock.addEventListener('click',function(e){
            
            const ticketIdx = getTicketIdx(id);
            if(ticketLock.classList.contains(lockClass)){
                ticketLock.classList.remove(lockClass);
                ticketLock.classList.add(unlockClass);
                
                //give permission to contain edit in task area.
                ticketTaskArea.setAttribute('contenteditable','true');
            }else{
                ticketLock.classList.remove(unlockClass);
                ticketLock.classList.add(lockClass);

                //take back permission
                ticketTaskArea.setAttribute('contenteditable','false');
            }

            //modify data in local storage (Ticket Task)
            ticketsArray[ticketIdx].ticketCont = ticketTaskArea.innerText;
            localStorage.setItem('jira_tickets',JSON.stringify(ticketsArray));
    });
}

function handleTicketColorOnClick(ticket,id){

    const ticketColor = ticket.querySelector('.ticket-color');
     
    //addEventListener on ticketcolor
    ticketColor.addEventListener('click',function(e){
           
          //get Tiket idx from array of tickets.  
          const idx = getTicketIdx(id);
          
          const currentTicketColor = ticketColor.classList[1];
          //get ticket color idx
          let currentTicketColorIdx = colors.findIndex(function(color){
              return currentTicketColor===color;
          });

          let newTicketColorIdx = (currentTicketColorIdx+1)%colors.length;
          let newTicketColor = colors[newTicketColorIdx];

          ticketColor.classList.remove(currentTicketColor);
          ticketColor.classList.add(newTicketColor);


          //modify data-in local storage. (priority Color change)
          ticketsArray[idx].ticketColor = newTicketColor;
          localStorage.setItem('jira_tickets',JSON.stringify(ticketsArray)) //overide new data on old data.
    });
}


//filtering on double click functionality.
toolBoxColors.forEach(function(currentToolBoxColor){

    //addEventListeners on tool-box color for filteration purpose.
    currentToolBoxColor.addEventListener('click',function(e){

          let currentToolBoxColorVal = currentToolBoxColor.classList[0];

          // for filtering.
          const filteredTickets = ticketsArray.filter(function(ticketObj,idx){
                return currentToolBoxColorVal===ticketObj.ticketColor;
          });

          //first remove tickets || remove previous tickets. 
          const allTicketsCont = document.querySelectorAll('.ticket-cont');
          for(let i=0;i<allTicketsCont.length;i++){
              allTicketsCont[i].remove();
          }

          //display filtered Tickets.
          for(let i=0;i<filteredTickets.length;i++){
               const {ticketColor,ticketId,ticketTask} = filteredTickets[i];
               //due to this duplicacy is happens.
               createTicket(ticketColor,ticketId,ticketTask);
          }
    });

    //add double click functionality
    currentToolBoxColor.addEventListener('dblclick',function(e){

          //first remove tickets || remove previous tickets. 
          const allTicketsCont = document.querySelectorAll('.ticket-cont');
          for(let i=0;i<allTicketsCont.length;i++){
              allTicketsCont[i].remove();
          }

          //display all tickts
          ticketsArray.forEach(function(currTicketObj){
             const {ticketColor,ticketId,ticketTask} = currTicketObj;
             //due to this duplicacy is happens.
             createTicket(ticketColor,ticketId,ticketTask);
          });
    });

});




