// Makes it easier for debug to have access to the app
let glob_app = null;

// Polyfill for object.entries
if (!Object.entries) {
    Object.entries = function entries(obj, key) {
        var entriesObj = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)) {
                entriesObj.push([key, obj[key]]);
            }
        }
        return entriesObj;
    };
}

window.addEventListener('load', (event)=>{
    glob_app = App.getInstance();
});