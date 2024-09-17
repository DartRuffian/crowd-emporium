document.addEventListener('DOMContentLoaded', () => {
    const updateEventForm = document.getElementById('updateEventForm');

    updateEventForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const eventId = localStorage.getItem('eventId');
        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const seatPrice = parseFloat(document.getElementById('seatPrice').value);
        const seatPriceOg = parseFloat(document.getElementById('seatPriceOg').value);
        const seatPriceVip = parseFloat(document.getElementById('seatPriceVip').value);
        const seatPriceRes = parseFloat(document.getElementById('seatPriceRes').value);

        const confirmed = confirm('Are you sure you want to update/delete this event?');
        if (!confirmed) {
            return;
        }

        if (event.submitter.id === 'updateButton') {
            try {
                const updatedEvent = await updateEvent(eventId, {
                    event_id: eventId,
                    event_name: eventName,
                    event_date: eventDate,
                    event_time: eventTime,
                    seat_price: seatPrice,
                    seat_price_original: seatPriceOg,
                    seat_price_vip: seatPriceVip,
                    seat_price_reserved: seatPriceRes
                });
                window.alert("Event updated successfully");
            } catch (error) {
                console.error("Failed to update event:", error);
            }
        } else if (event.submitter.id === 'deleteButton') {
            try {
                const deletedEvent = await deleteEvent(eventId);
                window.alert('Event deleted:', deletedEvent);
                updateEventForm.reset();

                // Remove the deleted event from the dropdown
                const eventDropdown = document.getElementById('eventDropdown');
                const optionToDelete = eventDropdown.querySelector(`option[value="${eventId}"]`);
                if (optionToDelete) {
                    eventDropdown.removeChild(optionToDelete);
                }
            } catch (error) {
                console.error('Failed to delete event: ', error);
            }
        }
    });
});
