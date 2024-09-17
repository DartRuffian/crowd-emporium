function onLoad(rowType) {
    var params = new URLSearchParams(location.search);
    globalThis.event_id = params.get('event_id');
    globalThis.section_number = params.get('section_number');

    fetch(`/event/${event_id}`)
    .then(response => response.json())
    .then(event => {
        window.top.document.title = `${event.event_name} | Select your seats!`;
    })

    fetch(`/event/seats/${event_id}/${section_number}`)
    .then(response => response.json())
    .then(seats => {
        // sorts seat list by seat_id so they show in the right spot
        seats.sort((a, b) => a.seat_id - b.seat_id);

        // creates the seats with attribute seat_id
        const row = document.querySelector(`.${rowType}`);

        let counter = 0;
        seats.forEach(seat_id => {
            // Creates the labels on the left of the seats
            if (counter === 0) {
                var para = document.createElement("p");
                var text = document.createTextNode("VIP");
                para.appendChild(text);
                row.appendChild(para);
                counter += 1;
            }
            else if (counter === 11 || counter === 22) {
                para = document.createElement("p");
                text = document.createTextNode("RES");
                para.appendChild(text);
                row.appendChild(para);
                counter += 1;
            }
            else if (counter === 33 || counter === 44) {
                para = document.createElement("p");
                text = document.createTextNode("GA");
                para.appendChild(text);
                row.appendChild(para);
                counter += 1;
            }

            const seat = document.createElement("div");
            seat.classList.add("seat");
            seat.setAttribute('seat_id', seat_id.seat_id)
            row.appendChild(seat);
            counter += 1;

            // select seats function
            seat.addEventListener("click", () => {
                seat.classList.toggle("selected");
            });

            // check if any have user_id != null, then mark those as reserved
            if (seat_id.user_id !== null) {
                seat.classList.add("reserved");
            }

        })
        let seat_number = 0;
        while (seat_number <= 10) {
            if (seat_number === 0) {
                para = document.createElement("p");
                text = document.createTextNode("");
                para.appendChild(text);
                row.appendChild(para);
                seat_number += 1;
            } else {
                para = document.createElement("p");
                text = document.createTextNode(`${seat_number}`);
                para.appendChild(text);
                row.appendChild(para);
                seat_number += 1;
            }
        }
    })
}

function fillPriceLegend() {
    fetch(`/event/${event_id}`)
    .then(response => response.json())
    .then(eventDetails => {
        // multipliers
        let baseSeat = eventDetails.seat_price;
        baseSeat = baseSeat.toFixed(2);
        let resMultiplier = eventDetails.seat_price_reserved;
        let vipMultiplier = eventDetails.seat_price_vip;

        // vip price for legend
        vipSpan = document.getElementById("vipSpan");
        let vipPrice = (baseSeat * vipMultiplier).toFixed(2);
        text = document.createTextNode(`$${vipPrice}`);
        vipSpan.appendChild(text);

        // res price for legend
        resSpan = document.getElementById("resSpan");
        let resPrice = (baseSeat * resMultiplier).toFixed(2);
        text = document.createTextNode(`$${resPrice}`);
        resSpan.appendChild(text);

        // ga price for legend
        gaSpan = document.getElementById("gaSpan");
        text = document.createTextNode(`$${baseSeat}`);
        gaSpan.appendChild(text);
    })
}

document.getElementById("paymentPageButton").onclick = function () {
    const seat = document.querySelectorAll(".seat");
    let selected_seats = [];
    // Loop through each seat to check if it's selected
    seat.forEach((item) => {
        if (item.classList.contains("selected")) {
            // If a seat is selected, add its ID to the selected_seats array
            userID = item.getAttribute("seat_id");
            selected_seats.push(userID);
            sel_seat = true;
        }
    });
    // Store selected seat IDs, event ID, and section number in session storage
    sessionStorage.setItem("selected_seats", selected_seats);
    sessionStorage.setItem("event_id", event_id);
    sessionStorage.setItem("section_number", section_number);
    // Check if at least one seat is selected in the array
    if (selected_seats != '') {
        // If seats are selected, navigate to the payment page
        location.href = `/website/BodiesUI/payment/payment.html`;
    } else {
        // If no seats are selected, show an alert to select a seat first
        window.alert('Need to select a seat first!');
    }
}

document.getElementById("sectionsPageButton").onclick = function () {
    sessionStorage.clear();
    location.href = `/website/BodiesUI/sections/sections.html?event_id=${event_id}`
}

window.addEventListener("DOMContentLoaded", () => {
    onLoad("middle-row");
    fillPriceLegend();
});
