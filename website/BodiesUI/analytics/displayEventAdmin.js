fetch(`/event`) // Fetch all events
    .then(response => response.json())
    .then(events => {
        const eventDropdown = document.getElementById('eventDropdown');

        // Add a placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Select an Event'; // Placeholder text
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        eventDropdown.appendChild(placeholderOption);

        // Populate dropdown menu with event options
        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.event_id;
            option.textContent = event.event_name;
            eventDropdown.appendChild(option);
        });

        // Event listener for the dropdown/menu change
        eventDropdown.addEventListener('change', () => {
            const selectedEventId = eventDropdown.value;

            //store the selectedEventId in local storage
            localStorage.setItem('eventId', selectedEventId);
            console.log('stored eventId in displayEvent.js: ', selectedEventId);
            // Only proceed if an actual event is selected
            if (selectedEventId) {
                displayEventData(selectedEventId);
            } else {
                clearFormFields();
            }
        });
    })
    .catch(error => {
        console.error('Error fetching events:', error);
    });

// Display event Data
function displayEventData(eventId) {
    fetch(`/event/${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch event');
            }
            return response.json();
        })
        .then(event => {
            document.getElementById('eventId').value = event.event_id;
            document.getElementById('eventName').value = event.event_name;
            document.getElementById('eventDate').value = event.event_date;
            document.getElementById('eventTime').value = event.event_time;
            document.getElementById('seatPrice').value = event.seat_price;
            document.getElementById('seatPriceOg').value = event.seat_price_original;
            document.getElementById('seatPriceVip').value = event.seat_price_vip;
            document.getElementById('seatPriceRes').value = event.seat_price_reserved;
        })
        .catch(error => {
            console.error('Error fetching event details:', error);
        });
};

function clearFormFields() {
    document.getElementById('eventName').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTime').value = '';
    document.getElementById('seatPrice').value = '';
};
