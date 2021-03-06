const SS_TOKEN_KEY = 'token';
const SS_EXPIRES_KEY = 'expires';
const SS_USER_KEY = 'user';

let panel = null;

// If session storage is available,
// use session storage to check if we had
// a token already
if('sessionStorage' in window) {
    if(sessionStorage.getItem(SS_TOKEN_KEY)
        && sessionStorage.getItem(SS_EXPIRES_KEY)
        && sessionStorage.getItem(SS_USER_KEY)) {
        let token = {
            token: sessionStorage.getItem(SS_TOKEN_KEY),
            expires: sessionStorage.getItem(SS_EXPIRES_KEY),
            user: sessionStorage.getItem(SS_USER_KEY)
        };
        initPanel(new ApiService(token, true), token);
    }
}

$('#form-signin').submit(function(event){
    event.preventDefault();

    $("#sessionExpired").css("display", "none");
    
    let user = $(this).find('#inputUser').val();
    let pass = $(this).find('#inputPassword').val();
    $(this).find('#inputPassword').val(''); // For security

    let svc = new ApiService(undefined, true);
    svc.login(user, pass, (token)=>initPanel(svc, token), (...x)=>loginError(...x));
});

function initPanel(svc, token) {
    let expirationDate = new Date(token.expires);
    // We want to renew if it is gonna expire in 5 minutes, discard it
    let now = new Date((new Date()).getTime() + 5*60000);

    if(expirationDate>now) {
        // Save token if possible
        if('sessionStorage' in window) {
            sessionStorage.setItem(SS_TOKEN_KEY, token.token);
            sessionStorage.setItem(SS_EXPIRES_KEY, token.expires);
            sessionStorage.setItem(SS_USER_KEY, token.user);
        }
        $('main.login').remove();
        $('main.panel').css('display', 'block');
        panel = new Panel(svc, token);

        let millis = Math.abs(expirationDate - now) + 180000; // Two minutes before we reload the page
        setTimeout(()=>location.reload(), millis);
    } else {
        if('sessionStorage' in window) {
            sessionStorage.removeItem(SS_TOKEN_KEY);
            sessionStorage.removeItem(SS_EXPIRES_KEY);
            sessionStorage.removeItem(SS_USER_KEY);
        }
        $("#sessionExpired")
            .text("The previous session has expired")
            .css("display", "block");
    }
}

function loginError(status, error) {
    $("#sessionExpired")
        .text(error)
        .css("display", "block");
}

function loggedOut() {
    if(panel) {
        if('sessionStorage' in window) {
            sessionStorage.removeItem(SS_TOKEN_KEY);
            sessionStorage.removeItem(SS_EXPIRES_KEY);
            sessionStorage.removeItem(SS_USER_KEY);
        }
        location.reload();
    }
}

/**
 * Generates the periods html for the item, grouping periods on sucessive
 * days into single lines.
 * @param {Item} item - The item to print the periods for
 * @return {string}
 */
function periodsStrFor(item) {
    // We will group periods with the same schedule
    let startedSchedules = Period.groupPeriodsWithSameSchedule(item.openingHours);
    // Now we will print one line per schedule
    let htmlStr = "";
    for(let schedule of startedSchedules) {
        let startDay = schedule.startPeriod.startDayStr();
        let endDay = schedule.endPeriod.startDayStr();
        let startHour = schedule.startPeriod.startHourStr();
        let endHour = schedule.startPeriod.endHourStr();
        let days =
            startDay !== endDay ?
            `${startDay}-${endDay}` :
            (schedule.startPeriod.startHour > schedule.startPeriod.endHour ?
                'Monday-Sunday' : startDay);
        htmlStr += `${days} ${startHour}-${endHour}<br>`;
    }
    return htmlStr;
}