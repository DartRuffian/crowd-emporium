def main() -> None:
    with open("output.sql", "w") as f:
        seat_id = 1
        for event_id in range(1, 5):
            section_number = 1  # max: 10
            row_number = 1  # max: 5
            seat_number = 1  # max: 10
            seat_type = ""
            while section_number <= 10:
                if row_number == 6:
                    row_number = 1
                while row_number <= 5:
                    if seat_number == 11:
                        seat_number = 1
                    if row_number == 1:
                        seat_type = 'vip'
                    elif row_number == 2 or row_number == 3:
                        seat_type = 'res'
                    elif row_number == 4 or row_number == 5:
                        seat_type = 'ga'

                    while seat_number <= 10:
                        f.write(f"    ({seat_number}, {row_number}, {section_number}, '{seat_type}', {event_id}, NULL, NULL),\n")
                        seat_number += 1
                        seat_id += 1
                    row_number += 1
                section_number += 1


if __name__ == "__main__":
    main()
