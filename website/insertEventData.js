// Fetch event details based on event ID
function fetchEventDetails(event_id) {
    fetch(`/event/${event_id}`)
        .then(response => response.json())
        .then(event => {
            // Update the HTML content with event details
            const eventDetailsSection = document.getElementById('event-details-section');
            eventDetailsSection.innerHTML = `
            <li>: ${event.event_name}</li>
            <li>: ${formatDate(event.event_date)}</li>
            <li>: ${formatTime(event.event_time)}</li>
            `;
        })
        .catch(error => console.error('Error fetching event details:', error));
}

// Function to retrieve the eventId from local storage
function getStoredEventId() {
    // Retrieve the eventId from local storage
    const eventId = localStorage.getItem('eventId');

    if (eventId) {
        // If eventId exists, return it
        console.log('Event ID retrieved from local storage:', eventId);
        return eventId;
    } else {
        console.error('Event ID not found in local storage.');
        return null;
    }
}

// Call the function to retrieve the eventId
const eventId = getStoredEventId();
fetchEventDetails(eventId);


// Function to format date to 'Month Name - Day' format
const formatDate = dateString => {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

// Function to format time to standard time
const formatTime = timeString => {
    try {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid Time';
    }
};

// Gets parameters of URL based on current window location
function getSearchParameters() {
    console.log("Window Location: ", window.location);
    var prmstr = window.location.search.substr(1);
    console.log("Query string:", window.Location.search);
    console.log("Processed query string: ", prmstr);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

// Inserts parameters into array
function transformToAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

// call function
var params = getSearchParameters();

//test
console.log(params)
