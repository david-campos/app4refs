$('#form-signin').submit(function(event){
    event.preventDefault();
    
    let user = $(this).find('#inputUser').val();
    let pass = $(this).find('#inputPassword').val();

    let svc = new ApiService();
    svc.getItems('info_legal', (items)=>console.log(items));
});