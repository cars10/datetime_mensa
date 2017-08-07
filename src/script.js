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
    var minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    document.querySelector('#hours').innerHTML = date.getHours();
    document.querySelector('#minutes').innerHTML = minutes;

    document.querySelector('#year').innerHTML = date.getUTCFullYear();
    document.querySelector('#month').innerHTML = calendarmonths[date.getUTCMonth()];
    document.querySelector('#weekday').innerHTML = weekdays[date.getUTCDay()];
    document.querySelector('#day').innerHTML = date.getDate();
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

    // parse Zusätze
    var zusatz1 = day.getElementsByTagName('zusatz1')[0]; // "Menü 1"
    var zusatzv = day.getElementsByTagName('zusatzv')[0]; // "Vegetarisch"
    var zusatzvegan = day.getElementsByTagName('zusatzvegan')[0]; // "Vegan"
    var zusatze = day.getElementsByTagName('zusatze')[0]; // "Extratheke"
    var zusatzd = day.getElementsByTagName('zusatzd')[0]; // "Vital"
    var zusatzb = day.getElementsByTagName('zusatzb')[0]; // "Bistro"
    var zusatza = day.getElementsByTagName('zusatza')[0]; // "Abendmensa"

    var datestring = day.innerHTML.substring(0, 10); // date as string like "2017-01-03"

    // parse date
    var miliseconds = Date.parse(datestring);
    var seconds = miliseconds / 1000;
    var date = new Date(0); // 1970.01.01
    date.setUTCSeconds(seconds);

    var day_weekday = date.getDay();

    // set text
    setMenuText("#menu1_" + day_weekday, menu1, zusatz1);
    setMenuText("#menuv_" + day_weekday, menuv, zusatzv);
    setMenuText("#menuvegan_" + day_weekday, menuvegan, zusatzvegan);
    setMenuText("#menue_" + day_weekday, menue, zusatze);
    setMenuText("#menud_" + day_weekday, menud, zusatzd);
    setMenuText("#menub_" + day_weekday, menub, zusatzb);
    setMenuText("#menua_" + day_weekday, menua, zusatza);

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

function setMenuText(selector, menu, zusatz) {
    var element = document.querySelector(selector);
    element.innerHTML = parseMensaMenu(menu, zusatz);
    if (zusatz !== null && zusatz !== undefined && zusatz.textContent !== undefined && zusatz.textContent.length !== 0) {
        element.setAttribute('title', 'Zusätze: ' + fixCommas(zusatz.textContent));
    }
}

/**
 * parseMensaMenu(food_text_node, zusatz_text_node)
 *
 * Returns the text from the food text node, minus the annoying parenthesis with the "zusatze".
 *
 * @param food_text_node {Object} - Whats on the menu?
 * @param zusatz_text_node {Object} - Zusaetze for the menu
 * @return div {String} - The actual menu string
 */
function parseMensaMenu(food_text_node, zusatz_text_node) {
    if (food_text_node !== undefined && food_text_node.textContent !== undefined) {
        var text_node_content =  food_text_node.textContent;
        if (zusatz_text_node !== undefined && zusatz_text_node.textContent !== undefined) {
            var zusatz_text_content = zusatz_text_node.textContent;
            var zusaetze = zusatz_text_content.split(',');
            var parenthesises = text_node_content.match(/\(([a-zA-Z]|\d|\s|,)*\)/g);
            if (parenthesises !== null) {
                // loop all found parenthesises
                for (var i = 0; i < parenthesises.length; i++) {
                    var parenthesis = parenthesises[i];
                    var content = parenthesis.replace(/(\(|\))/g, '').split(',');
                    var replace_content = true;
                    // loop the split content for each parenthesis
                    for (var j = 0; j < content.length; j++) {
                        var element = content[j];
                        if (zusaetze.indexOf(element) === -1) {
                            replace_content = false;
                        }
                    }

                    // remove parenthesis from text if all elements in parenthesis are included in "zusaetze"
                    if (replace_content === true) {
                        text_node_content = text_node_content.replace(parenthesis, '');
                    }
                }
            }
        }
        return fixCommas(text_node_content);
    }
}

/**
 * fixCommas
 * 
 * Replaces commas without a trailing whitespace with correct ones
 * Replaces commas with leading whitespace with correct ones
 * 
 * @param string  {String}
 */
function fixCommas(string) {
    return string.replace(/,(?!\s)/g, ', ').replace(/\s,/g, ',');
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
