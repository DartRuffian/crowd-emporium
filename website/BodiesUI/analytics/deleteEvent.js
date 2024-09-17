async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/event/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
                // Add any additional headers if required
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to delete event');
        }

        const eventData = await response.json();
        // Reset the dropdown value after successful deletion
        document.getElementById('eventDropdown').value = '';
    } catch (error) {
        console.error('Error deleting event:', error.message);
        throw error;
    }
}
