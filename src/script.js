// Variables we need to display date & time
var calendarmonths = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
var weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
var today = new Date;

/**
 * UpdateTime()
 *
 * Takes the current date apart and sets the contents into their corresponding DOM elements.
 */
function updateTime() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    var year = date.getUTCFullYear();
    var month = date.getUTCMonth();
    var day = date.getDate();
    var weekday = date.getUTCDay();

    document.querySelector('#hours').innerHTML = hours;
    document.querySelector('#minutes').innerHTML = minutes;

    document.querySelector('#year').innerHTML = year;
    document.querySelector('#month').innerHTML = calendarmonths[month];
    document.querySelector('#weekday').innerHTML = weekdays[weekday];
    document.querySelector('#day').innerHTML = day;
}

/**
 * disableSubmitButton(btn)
 *
 * Submits the buttons form and disables itself. Also replaces the buttontext to match the current "loading" state
 *
 * @param btn {Object} - the Button that got clicked
 */
function disableSubmitButton(btn) {
    btn.form.submit();
    btn.disabled = true;
    btn.innerHTML = 'Suche ...';
}

/**
 * xhr(url, method, success)
 *
 * Executes a XMLHttpRequest of method +method+ to url +url+ and executes +success+ with the given response as param.
 *
 * @param url {String} - the URL to call
 * @param method {String} - HTTP Method to use (GET/POST)
 * @param success {Function} - callback function that gets executed on success
 */
function xhr(url, method, success) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.send(null);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            success(xhr.responseText);
        }
    }
    // TODO handle errors!
}

/**
 * buildMensaPlan(response_xml)
 *
 * Takes the xml of the mensa plan and builds the DOM elements to show it on the page.
 *
 * @param response_xml {String} - the xml response from the xhr call
 */
function buildMensaPlan(response_xml) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(response_xml, 'text/xml');
    var dates = doc.getElementsByTagName('Datum');
    var dates_array = [].slice.call(dates); // convert HTMLCollection to Array
    var weekday = today.getUTCDay();
    if (weekday === 0 || weekday === 6) {
        // its the weekend, show the plan for the next week already
        dates_array = dates_array.slice(5, 10); // take days 5 - 10
    } else {
        dates_array = dates_array.slice(0, 5); // only take first 5 days
    }

    for (var i = 0; i < dates_array.length; i++) {
        buildMensaDay(dates_array[i]);
    }

    document.querySelector("#start_date").innerHTML = dates_array[0].innerHTML.substring(0, 10);
    document.querySelector("#end_date").innerHTML = dates_array[dates_array.length - 1].innerHTML.substring(0, 10);
}

/**
 * buildMensaDay(day)
 *
 * Builds a single mensa day with a given +day+ object
 *
 * @param day {Object} - on day element from the xml
 */
function buildMensaDay(day) {
    // parse menus
    var menu1 = day.getElementsByTagName('menu1')[0]; // "Menü 1"
    var menuv = day.getElementsByTagName('menuv')[0]; // "Vegetarisch"
    var menuvegan = day.getElementsByTagName('menuvegan')[0]; // "Vegan"
    var menue = day.getElementsByTagName('menue')[0]; // "Extratheke"
    var menud = day.getElementsByTagName('menud')[0]; // "Vital"
    var menub = day.getElementsByTagName('menub')[0]; // "Bistro"
    var menua = day.getElementsByTagName('menua')[0]; // "Abendmensa"

    var datestring = day.innerHTML.substring(0, 10); // date string like "2017-01-03"

    // parse date
    var miliseconds = Date.parse(datestring);
    var seconds = miliseconds / 1000;
    var date = new Date(0); // 1970.01.01
    date.setUTCSeconds(seconds);

    var day_weekday = date.getDay();

    // set text
    document.querySelector("#menu1_" + day_weekday).innerHTML = getMensaMenu(menu1);
    document.querySelector("#menuv_" + day_weekday).innerHTML = getMensaMenu(menuv);
    document.querySelector("#menuvegan_" + day_weekday).innerHTML = getMensaMenu(menuvegan);
    document.querySelector("#menue_" + day_weekday).innerHTML = getMensaMenu(menue);
    document.querySelector("#menud_" + day_weekday).innerHTML = getMensaMenu(menud);
    document.querySelector("#menub_" + day_weekday).innerHTML = getMensaMenu(menub);
    document.querySelector("#menua_" + day_weekday).innerHTML = getMensaMenu(menua);

    // append extra class if date is today, used for different font color
    if (datesEqual(today, date)) {
        document.querySelector("#weekday_" + day_weekday).className += " white";
        document.querySelector("#menu1_" + day_weekday).className += " white";
        document.querySelector("#menuv_" + day_weekday).className += " white";
        document.querySelector("#menuvegan_" + day_weekday).className += " white";
        document.querySelector("#menue_" + day_weekday).className += " white";
        document.querySelector("#menud_" + day_weekday).className += " white";
        document.querySelector("#menub_" + day_weekday).className += " white";
        document.querySelector("#menua_" + day_weekday).className += " white";
    }
}

/**
 * buildMensamenu(food_text)
 *
 * Builds a div for one menu with its text
 *
 * @param food_text_node {Object} - Whats on the menu?
 * @return div {Object} - one menu div
 */
function getMensaMenu(food_text_node) {
    if (food_text_node !== undefined && food_text_node.textContent !== undefined) {
        return food_text_node.textContent;
    }
}

/**
 * datesEqual(date1, date2)
 *
 * Checks if two given dates are equal based on year, month and day. FU javascript!
 *
 * @param date1 {Date} - the first date
 * @param date2 {Date} - the second date
 * @return {Boolean} true if equal
 */
function datesEqual(date1, date2) {
    return (date1.getUTCFullYear() === date2.getUTCFullYear()) &&
        (date1.getUTCMonth() === date2.getUTCMonth())
        && (date1.getDate() === date2.getDate())
}