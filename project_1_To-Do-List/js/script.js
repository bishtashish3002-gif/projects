// here is Getting all requred elements
const inputField = document.querySelector(".input-field textarea"),
    todoLists = document.querySelector(".todoLists"),
    pendingNum = document.querySelector(".pending-num"),
    clearButton = document.querySelector(".clear-button");

//we will call this function while adding, deleteing and checking-unchecking the task
function allTasks(){
    let tasks = document.querySelectorAll(".pending");

    //if tasks lenght is 0 then pending num tet content will be no, if not then pending num value will be task's length
    pendingNum.textContent = tasks.length === 0 ? "no": tasks.length;
    let allLists= document.querySelectorAll(".list");
    if(allLists.length>0){
        todoLists.style.marginTop = "20px";
        clearButton.style.pointerEvents = "auto";
        return;
    }
    todoLists.style.marginTop = "0px";
    clearButton.style.pointerEvents = "none";
}
// add task while we put while in text area and press enter 
inputField.addEventListener("keyup",(e)=>{
    let inputVal = inputField.value.trim();// trim function remove space of front and back of the inputed value
    // if enter buttion is clicked and inputed value lenght is greated 
    if(e.key ==="Enter" && inputVal.length > 0){
        let liTag =`<li class="list pending" onclick="handleStaturs(this)">
            <input type ="checkbox"/>
            <span class="task">${inputVal}</span>
            <i class="uil uil-trash" onclick="deleteTask(this)"></i>
            </li>`;
        
        todoLists.insertAdjacentHTML("beforeend", liTag); //inserting li tag inside the todolist div 
        inputField.value= ""; // removing value form the input field.
        allTasks();
    }
});

// checking and unchancking the checkbox while we click on the task
function handleStaturs(e){
    const checkbox= e.querySelector("input"); // getting checkbox.
    e.classList.toggle("pending");
    allTasks();
}
// deleting all the tasks while we clidck on the clear botton.
clearButton.addEventListener("click",()=>{
    todoLists.innerHTML = "";
});
