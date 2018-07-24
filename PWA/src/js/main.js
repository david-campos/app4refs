// Makes it easier for debug to have access to the app
let glob_app = null;
window.addEventListener('load', (event)=>{
    glob_app = App.getInstance();
});