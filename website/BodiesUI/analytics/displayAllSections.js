document.getElementById('displayAllSections').addEventListener('click', () => {
    const selectedEventId = document.getElementById('eventDropdown').value;
    displayAllSectionData(selectedEventId);
});

async function displayAllSectionData(eventId) {
    // Clear existing section data
    const sectionDataContainer = document.getElementById('sectionDetails');
    if (sectionDataContainer) {
        sectionDataContainer.innerHTML = '';
    }

    try {
        // Fetch event data
        const response = await fetch(`/event/${eventId}`);
        const event = await response.json();

        // Function to format date to Month - Day
        const formatDate = dateString => {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric'}).format(date);
        };

        // Function to format time to standard time
        const formatTime = timeString => {
            return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        };

        // Display event information
        const displayAllSections = document.getElementById('sectionDetails');
        displayAllSections.innerHTML = `
            <div class="account-details">
                <h2>${event.event_name}</h2>
                <h4>${formatDate(event.event_date)}, ${formatTime(event.event_time)}</h4>
                <h4>Crowd Emporium </h4>
            </div>
        `;

        // Initialize variables to store total seats available and total seats reserved
        let totalSeatsAvailable = 0;
        let totalSeatsReserved = 0;
        let totalRevenue = 0;

        // Create a container for section data
        const sectionDataContainer = document.createElement('div');
        sectionDataContainer.id = 'sectionData';

        // Fetch and display seats data for all sections sequentially
        for (let sectionId = 1; sectionId <= 10; sectionId++) {
            const sectionResponse = await fetch(`/event/seats/${eventId}/${sectionId}`);
            const seats = await sectionResponse.json();

            const displayAllSectionsInSection = seats.filter(seat => seat.user_id !== null).length;
            const availableSeatsInSection = seats.length - displayAllSectionsInSection;

            // Update total seats available and total seats reserved
            totalSeatsAvailable += availableSeatsInSection;
            totalSeatsReserved += displayAllSectionsInSection;

            // Calculate section revenue
            let sectionRevenue = 0;
            seats.forEach(seat => {
                if (seat.user_id !== null) {
                    sectionRevenue += parseFloat(seat.purchase_price);
                }
            });
            // Add section revenue to total revenue
            totalRevenue += sectionRevenue;


            let reservedSeatsGA = 0;
            let reservedSeatsRES = 0;
            let reservedSeatsVIP = 0;

            seats.forEach(seat => {
                if (seat.seat_type === 'ga' && seat.user_id !== null) {
                    reservedSeatsGA++;
                } else if (seat.seat_type === 'res' && seat.user_id !== null) {
                    reservedSeatsRES++;
                } else if (seat.seat_type === 'vip' && seat.user_id !== null) {
                    reservedSeatsVIP++;
                }
            });

            // Append section data to the sectionDataContainer
            sectionDataContainer.innerHTML += `
                <div class="section-details">
                    <h2>Section ${sectionId}:</h2>
                    <p>Total Seats: ${seats.length}</p>
                    <p>Reserved Seats: ${displayAllSectionsInSection}</p>
                    <p>Available Seats: ${availableSeatsInSection}</p>
                    <p>Total Seats Reserved in VIP: ${reservedSeatsVIP}</p>
                    <p>Total Seats Reserved in RES: ${reservedSeatsRES}</p>
                    <p>Total Seats Reserved in GA: ${reservedSeatsGA}</p>
                </div>
            `;
        }

        // Display total seats available and total seats reserved above section details
        sectionDataContainer.innerHTML = `
            <div class="section-details">
                <h2>Total Seats Available: ${totalSeatsAvailable}</h2>
                <h2>Total Seats Reserved: ${totalSeatsReserved}</h2>
                <h2>Total Revenue: $${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h2>
            </div>
        ` + sectionDataContainer.innerHTML;

        // Append sectionDataContainer to displayAllSections
        displayAllSections.appendChild(sectionDataContainer);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
