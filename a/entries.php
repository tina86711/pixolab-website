<?php
session_start();
if (!isset($_SESSION["authed"]) || $_SESSION["authed"] === false) {
    header("location:entries-login.php");
    exit(307);
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSV Viewer with HTML, CSS & JavaScript</title>

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    
	<style>
		html, body {
			font-family: "Quicksand", sans-serif;
		}
        table {
            border-collapse: collapse;
            border-radius: 5px;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            font-family: "Quicksand", sans-serif;
            font-weight: bold;
            font-size: 14px;
            max-width: 860px;
            margin: 36px auto;
        }

        th {
            background: #009578;
            color: #ffffff;
            text-align: left;
        }

        a {
            color: #009578;
            text-decoration: none;
        }

        th,
        td {
            padding: 10px 20px;
        }

        tr:nth-child(even) {
            background: #eeeeee;
        }

		button {
            	font-size: 16px;
            	padding: 8px 12px;
            	border-radius: 4px;
            	appearance: none;
				border: 1px solid #888;
                background-color: #fff;
            }
    </style>
</head>

<body>
    <table id="csvRoot"></table>
    <button onclick="window.location.replace('entries-logout.php')" style="margin: 0 auto; display: block"> Logout </button>
    

    <script src="https://cdn.jsdelivr.net/npm/papaparse@5.2.0/papaparse.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script>
        class TableCsv {
            /**
             * @param {HTMLTableElement} root The table element which will display the CSV data.
             */
            constructor(root) {
                this.root = root;
            }

            /**
             * Clears existing data in the table and replaces it with new data.
             *
             * @param {string[][]} data A 2D array of data to be used as the table body
             * @param {string[]} headerColumns List of headings to be used
             */
            update(data, headerColumns = []) {
                this.clear();
                this.setHeader(headerColumns);
                this.setBody(data);
            }

            /**
             * Clears all contents of the table (incl. the header).
             */
            clear() {
                this.root.innerHTML = "";
            }

            /**
             * Sets the table header.
             *
             * @param {string[]} headerColumns List of headings to be used
             */
            setHeader(headerColumns) {
                this.root.insertAdjacentHTML(
                    "afterbegin",
                    `
            <thead>
                <tr>
                    ${headerColumns.map((text) => `<th>${text}</th>`).join("")}
                </tr>
            </thead>
        `
                );
            }

            /**
             * Sets the table body.
             *
             * @param {string[][]} data A 2D array of data to be used as the table body
             */
            setBody(data) {
                const rowsHtml = data.map((row) => {
                    return `
                <tr>
                    ${row.map((text,idx) => {
                        if (idx==1) return `<td><a href="tel:${text}">${text}</a></td>`;
                        if (idx==2) return `<td><a href="mailto:${text}">${text}</a></td>`
                        return `<td>${text}</td>`
                    }
                    ).join("")}
                </tr>
            `;
                });

                this.root.insertAdjacentHTML(
                    "beforeend",
                    `
            <tbody>
                ${rowsHtml.join("")}
            </tbody>
        `
                );
            }
        }

        const tableRoot = document.querySelector("#csvRoot");
        const tableCsv = new TableCsv(tableRoot);

        document.addEventListener('DOMContentLoaded', (e) => {

            axios.get('entries.csv')
                .then(function (response) {
                    Papa.parse(response.data, {
                        delimiter: ",",
                        skipEmptyLines: true,
                        complete: (results) => {
                            tableCsv.update(results.data.slice(1), results.data[0]);
                        }
                    });
                    console.log(response);
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
                .finally(function () {
                    // always executed
                });

        }, false);

    </script>
</body>

</html>