function onload() {
    var selected_seats = sessionStorage.getItem("selected_seats").split(",");
    selected_seats.pop();

    selected_seats.forEach(seat_id => {
        if (seat_id != "") {
            seat_id = Number(seat_id);
        }
        fetch(`/seat/${seat_id}`)
        .then(response => response.json())
        .then(ticket => {

            // Now using seat_id's event_id get event name, date, and time
            fetch(`/event/${ticket.event_id}`)
            .then(response => response.json())
            .then(event => {

                const formatDate = dateString => {
                    const date = new Date(dateString);
                    return new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric'}).format(date);
                };

                // Function to format time to standard time
                const formatTime = timeString => {
                    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                };



                const ticketInformationContainer = document.getElementById('ticketInformationContainer');
                const ticketDiv = document.createElement('div');
                ticketDiv.className = 'ticket';

                ticketDiv.innerHTML = `
                    <div class="ticket-body">
                        <div class="ticket">
                        <div class="holes-top"></div>
                            <div class="title">
                                <p class="cinema">${event.event_name}</p>
                                <p class="movie-title">Crowd Emporium</p>
                            </div>
                            <div class="poster">
                                <img src="../../../website/assets/Images/ce_logo_big.png"
                                    alt="Movie: Only God Forgives" />
                            </div>
                            <div class="info">
                                <table class="info-table ticket-table">
                                    <tr>
                                        <th>SECTION</th>
                                        <th>ROW</th>
                                        <th>SEAT</th>
                                    </tr>
                                    <tr>
                                        <td class="bigger">${ticket.section_number}</td>
                                        <td class="bigger">${ticket.seat_row}</td>
                                        <td class="bigger">${ticket.seat_number}</td>
                                    </tr>
                                </table>
                                <table class="info-table ticket-table">
                                    <tr>
                                        <th>PRICE</th>
                                        <th>DATE</th>
                                        <th>TIME</th>
                                    </tr>
                                    <tr>
                                        <td>$${ticket.purchase_price}</td>
                                        <td>${formatDate(event.event_date)}</td>
                                        <td>${formatTime(event.event_time)}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="holes-lower"></div>

                        </div>
                    </div>
                `;
                ticketInformationContainer.appendChild(ticketDiv);

                // Fetch the image data for this event using the event ID
                fetch(`/image/${event.event_id}`)
                .then(response => response.json())
                .then(image => {
                    // Update the inner HTML content of the event container with the image
                    const imageSrc = image.img_path;
                    const posterElement = ticketDiv.querySelector('.poster img');
                    posterElement.src = imageSrc;
                    posterElement.alt = event.event_name;
                })
                .catch(error => console.error('Error fetching image data:', error));
            })
        })
    })
}

document.getElementById("eventsPageButton").onclick = function () {
    location.href = `/website/events.html`;
}

document.getElementById("accountInformationPageButton").onclick = function () {
    location.href = `/website/accountInformation.html`;
}

window.addEventListener("DOMContentLoaded", () => {
    onload();
});
