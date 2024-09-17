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
            // Only proceed if an actual event is selected
            if (selectedEventId) {
                displayEventData(selectedEventId);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching events:', error);
    });

function displayEventData(eventId) {
    fetch(`/event/${eventId}`)
        .then(response => response.json())
        .then(event => {
            const reservedSeatsContainer = document.getElementById('reservedSeats');
            const sectionDetailsContainer = document.getElementById('sectionDetails');

            // Clear existing data in both containers
            if (reservedSeatsContainer) {
                reservedSeatsContainer.innerHTML = '';
            }
            if (sectionDetailsContainer) {
                sectionDetailsContainer.innerHTML = '';
            }

            // Create dropdown menu for selecting section
            const sectionDropdown = document.createElement('select');
            sectionDropdown.id = 'sectionDropdown';
            reservedSeatsContainer.appendChild(sectionDropdown);

            // Add the "Select Section" option
            const selectSectionOption = document.createElement('option');
            selectSectionOption.value = '';
            selectSectionOption.textContent = 'Select Section'; // Text for the option
            selectSectionOption.disabled = true;
            selectSectionOption.selected = true;
            sectionDropdown.appendChild(selectSectionOption);

            // Populate dropdown menu with section options
            for (let sectionId = 1; sectionId <= 10; sectionId++) {
                const option = document.createElement('option');
                option.value = sectionId;
                option.textContent = `Section ${sectionId}`;
                sectionDropdown.appendChild(option);
            }

            // Event listener for section dropdown change
            sectionDropdown.addEventListener('change', () => {
                const selectedSectionId = sectionDropdown.value;
                if (selectedSectionId) {
                    displaySectionData(eventId, selectedSectionId);
                } else {
                    // Handle case where user selects placeholder option
                    clearSectionDetails();
                }
            });
        })
        .catch(error => {
            console.error('Error fetching event data:', error);
        });
}



function displaySectionData(eventId, sectionId) {
    fetch(`/event/seats/${eventId}/${sectionId}`)
        .then(response => response.json())
        .then(seats => {
            // Ensure sectionDetailsContainer exists before proceeding
            const sectionDetailsContainer = document.getElementById('sectionDetails');
            if (!sectionDetailsContainer) {
                console.error('Error: sectionDetailsContainer is null.');
                return;
            }

            // Clear existing data
            sectionDetailsContainer.innerHTML = '';

            // Create section details container
            const sectionDetails = document.createElement('div');
            sectionDetails.id = 'sectionDetails';
            sectionDetailsContainer.appendChild(sectionDetails);

            // Initialize counters for reserved seats by type
            let reservedSeatsGA = 0;
            let reservedSeatsRES = 0;
            let reservedSeatsVIP = 0;

            // Iterate through seats to count reserved seats by type
            seats.forEach(seat => {
                if (seat.seat_type === 'ga' && seat.user_id !== null) {
                    reservedSeatsGA++;
                } else if (seat.seat_type === 'res' && seat.user_id !== null) {
                    reservedSeatsRES++;
                } else if (seat.seat_type === 'vip' && seat.user_id !== null) {
                    reservedSeatsVIP++;
                }
            });

            // Display section details
            const totalSeats = seats.length;
            const reservedSeatsInSection = reservedSeatsGA + reservedSeatsRES + reservedSeatsVIP;
            const availableSeatsInSection = totalSeats - reservedSeatsInSection;

            sectionDetails.innerHTML = `
                <h3>Section ${sectionId} Details:</h3>
                <p>Total Seats: ${totalSeats}</p>
                <p>Reserved Seats: ${reservedSeatsInSection}</p>
                <p>Available Seats: ${availableSeatsInSection}</p>
                <p>Total Seats Reserved in VIP: ${reservedSeatsVIP}</p>
                <p>Total Seats Reserved in RES: ${reservedSeatsRES}</p>
                <p>Total Seats Reserved in GA: ${reservedSeatsGA}</p>
            `;
        })
        .catch(error => {
            console.error(`Error fetching seats for section ${sectionId}:`, error);
        });
}
