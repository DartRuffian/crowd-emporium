async function updateEvent(eventId, eventData) {
    const url = `/event/${eventId}`;
    console.log('url: ', url);
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to update event: ${errorMessage}`);
    }

    return await response.json();
}
async function mainUpdate() {
    // Wait for the DOMContentLoaded event before attaching the event listener
    document.addEventListener('DOMContentLoaded', () => {
        // Event listener for the form submission
        document.getElementById('updateEventForm').addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the default form submission behavior

            const eventId = localStorage.getItem('eventId');

            // Function to read updated event data from HTML forms
            function getEventDataFromForm() {
                const eventData = {
                    event_id: document.getElementById('eventId').value,
                    event_name: document.getElementById('eventName').value,
                    event_date: document.getElementById('eventDate').value,
                    event_time: document.getElementById('eventTime').value,
                    seat_price: parseFloat(document.getElementById('seatPrice').value),
                    seat_price_original: parseFloat(document.getElementById('seatPriceOg').value),
                    seat_price_vip: parseFloat(document.getElementById('seatPriceVip').value),
                    seat_price_reserved: parseFloat(document.getElementById('seatPriceRes').value)
                };
                return eventData;
            }

            const eventData = getEventDataFromForm(); // Get updated event data from HTML forms
            try {
                const updatedEvent = await updateEvent(eventId, eventData);
                // Reset form fields after successful deletion
                //document.getElementById('updateEventForm').reset();
            } catch (error) {
                console.error("Failed to update event:", error);
            }
        });
    });
}

mainUpdate();
