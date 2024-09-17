fetch("/event")
    .then(response => response.json())
    .then(events => {
        // Sort the events array by date and time
        events.sort((a, b) => {
            const dateA = new Date(`${a.event_date}T${a.event_time}`);
            const dateB = new Date(`${b.event_date}T${b.event_time}`);
            return dateA - dateB;
        });

        const eventsContainer = document.getElementById('eventsContainer');

        const formatDate = dateString => {
            try {
                const date = new Date(dateString);
                // Adjust for time zone offset
                const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(adjustedDate);
            } catch (error) {
                console.error('Error formatting date:', error);
                return 'Invalid Date';
            }
        };
        // Function to format time to standard time
        const formatTime = timeString => {
            return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        };

        // Loop through each event in the sorted array
        events.forEach(event => {
            // Create a new event container
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event';

            let ticketsLink = `/website/BodiesUI/sections/sections.html?event_id=${event.event_id}`;

            // Set the inner HTML content for the event without the image
            eventDiv.innerHTML = `
                <div class="event-details">
                    <div>
                        <h2>${event.event_name}</h2>
                    </div>
                    <div>
                        <p>Date: ${formatDate(event.event_date)}</p>
                        <p>Time: ${formatTime(event.event_time)}</p>
                    </div>
                    <a href="${ticketsLink}" class="buy-tickets-btn">Buy Tickets</a>
                </div>
            `;

            // Append the event container to the main container
            eventsContainer.appendChild(eventDiv);

            // Fetch the image data for this event using the event ID
            fetch(`/image/${event.event_id}`)
                .then(response => response.json())
                .then(image => {
                    // Update the inner HTML content of the event container with the image
                    const imageSrc = image.img_path;
                    const eventDetailsDiv = eventDiv.querySelector('.event-details');
                    const imgElement = document.createElement('img');
                    imgElement.src = imageSrc;
                    imgElement.alt = event.event_name;
                    eventDetailsDiv.insertBefore(imgElement, eventDetailsDiv.firstChild);
                })
                .catch(error => console.error('Error fetching image data:', error));
        });
    })
    .catch(error => console.error('Error fetching data:', error));
