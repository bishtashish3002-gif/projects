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
