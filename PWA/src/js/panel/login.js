$('#form-signin').submit(function(event){
    event.preventDefault();
    
    let user = $(this).find('#inputUser').val();
    let pass = $(this).find('#inputPassword').val();
    $(this).find('#inputPassword').val(''); // For security

    let svc = new ApiService();

    svc.login(user, pass, (token)=>initPanel(token));
});

function initPanel(token) {
    $('main.login').remove();
    $('main.panel').css('display', 'block');
    $('main.panel h4').text(`Welcome, ${token.user}!`);
}