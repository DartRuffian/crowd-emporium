function onload() {
    const token = localStorage.getItem('token');
    if (token === null) {
        alert("You must be logged in to purchase any seats.");
        window.location.href = "/website/login.html";
    }

    fetch(`/users/me`, {
        headers: {
            Authorization: localStorage.getItem("token")
        }
    })
    .then(response => response.json())
    .then(user => {
        const user_id = user.user_id;
        const sumPriceContainer = document.getElementById('sumPriceContainer');

        // remove commas and remove last empty string of selected_seats list
        var selected_seats = sessionStorage.getItem("selected_seats").split(",");
        selected_seats.pop();

        let sumPrice = 0;
        console.log(selected_seats);
        selected_seats.forEach(seat_id => {
            if (seat_id !== "") {
                seat_id = Number(seat_id);
            }
            // fetch method to reserve the seats
            fetch(`/seat/reserve/${seat_id}/${user_id}`, {
                method: 'PUT',
            })
            .then(response => response.json())
            .then(seat => {
                sumPrice += seat.purchase_price;
                sumPriceContainer.innerText = `
                    Total: $${sumPrice}
                `;
            })
        })

        const event_id = sessionStorage.getItem("event_id");
        fetch(`/event/updatePrices/${event_id}`, {
            method: 'PUT'
        })
    })
}

document.getElementById("ticketsPageButton").onclick = function () {
    location.href = `/website/BodiesUI/tickets/tickets.html`;
}

document.getElementById("seatsPageButton").onclick = function () {
    let event_id = sessionStorage.getItem("event_id");
    let section_number = sessionStorage.getItem("section_number");
    var selected_seats = sessionStorage.getItem("selected_seats").split(",");
    selected_seats.pop();

    selected_seats.forEach(seat_id => {
        if (seat_id !== "") {
            seat_id = Number(seat_id);
        }
        fetch(`/seat/cancel/${seat_id}`, {
            method: 'PUT'
        })
    })
    sessionStorage.removeItem("selected_seats");
    location.href = `/website/BodiesUI/seats/seats.html?event_id=${event_id}&section_number=${section_number}`;
}

window.addEventListener("DOMContentLoaded", () => {
    onload();
});