async function createEvent(eventData) {
    const url = '/event/register';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to create event: ${errorMessage}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
}

async function createEventMain() {
    // Wait for the DOMContentLoaded event before attaching the event listener
    document.addEventListener('DOMContentLoaded', () => {
        // Event listener for the "create event" button
        document.getElementById('createEventForm').addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the default form submission behavior

            // Collect event data from form fields
            const eventData = {
                event_name: document.getElementById('eventName').value,
                // Correct the date handling to prevent subtraction of one day
                event_date: new Date(document.getElementById('eventDate').value).toISOString().split('T')[0],
                event_time: document.getElementById('eventTime').value,
                seat_price: parseFloat(document.getElementById('seatPrice').value),
                seat_price_original: parseFloat(document.getElementById('seatPrice').value),
                seat_price_vip: parseFloat(document.getElementById('seatPriceVip').value),
                seat_price_reserved: parseFloat(document.getElementById('seatPriceRes').value)
            };

            // Confirm with the user before deleting
            const confirmed = confirm('Are you sure you want to create this event?');
            if (!confirmed) {
                return; // Do nothing if user cancels
            }
            // Call the createEvent function with the collected data
            try {
                const createdEvent = await createEvent(eventData);
                window.alert("Event created successfully.");

                // Reset form fields after successful event creation
                document.getElementById('createEventForm').reset();
            } catch (error) {
                console.error("Failed to create event:", error);
            }
        });
    });
}

// Call the async function
createEventMain();
