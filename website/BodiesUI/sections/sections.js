function onLoad() {
    let params = new URLSearchParams(location.search);
    let event_id = params.get('event_id')

    fetch(`/event/${event_id}`)
    .then(response => response.json())
    .then(event => {
        window.top.document.title = `${event.event_name} | Select a section!`;
    })
}

function appendSeats(seats, rowType) {
    const row = document.querySelector(`.${rowType}`);
    for (let i = 1; i <= seats; i++) {
      if (i >= 11) {
        let seat_number = 1;
        while (seat_number <= 10) {
            para = document.createElement("span");
            text = document.createTextNode(` ${seat_number}`);
            para.appendChild(text);
            row.appendChild(para);
            seat_number += 1;
        }
        break
      }

      const seat = document.createElement("div");
      seat.classList.add("seat");
      seat.setAttribute('id', i);
      row.appendChild(seat);

      let params = new URLSearchParams(location.search);
      let event_id = params.get('event_id');
      let section_number = i;
      let totalSeats = 50;
      let counter = 0;

      fetch(`/event/seats/${event_id}/${section_number}`)
      .then(response => response.json())
      .then(seats => {
        seats.forEach((individSeat) => {
            if (individSeat.user_id !== null) {
                counter += 1;
            }
        })
        if (counter === totalSeats) {
            seat.classList.toggle("reserved");
        }
      })
    }
}
function selectSeats() {
    const seat = document.querySelectorAll(".seat");
    seat.forEach((item) => {
        item.addEventListener("click", () => {
            // Checks if selected seats if so deselects them
            seat.forEach((otherItem) => {
                if (otherItem !== item && otherItem.classList.contains("selected")) {
                    otherItem.classList.remove("selected");
                }
            });

            item.classList.toggle("selected");
            globalThis.section_number = item.id;

            console.log('section number selected: ' + section_number); // Testing purpose
            console.log("breakpoint");
        });
    });
}

function appendSections(sections, rowType) {
    const row = document.querySelector(`.${rowType}`);
    for (let i = 1; i <= sections; i++) {
        const section = document.createElement("div");
        section.classList.add("section");
        row.appendChild(section);
    }
}

document.getElementById("seatsPageButton").onclick = function () {
    let params = new URLSearchParams(location.search);
    let event_id = params.get('event_id')

    if (globalThis.section_number) {
        location.href = `/website/BodiesUI/seats/seats.html?event_id=${event_id}&section_number=${section_number}`;
    } else {
        window.alert('Need to select a section first!');
    }
}

document.getElementById("eventsPageButton").onclick = function () {
    location.href = `/website/events.html`;
}


window.addEventListener("DOMContentLoaded", () => {
    onLoad();
    appendSeats(20, "first-last-row");
    selectSeats();
});