$('#form-signin').submit(function(event){
    event.preventDefault();
    
    var user = $(this).find('#inputUser').val();
    var pass = $(this).find('#inputPassword').val();
});