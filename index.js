const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
require("./snapshot");
const config = require("./config.json");

// Sample data in JSON format
let jsonData = require("./holders.json");

// Function to get paginated data
const getPaginatedData = (page, pageSize) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return jsonData.slice(startIndex, endIndex);
};

// Route to display the table with pagination
app.get("/", (req, res) => {
    jsonData = require("./holders.json");
    const page = parseInt(req.query.page) || 1;
    const pageSize = 100;
    const totalItems = jsonData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedData = getPaginatedData(page, pageSize);

    res.send(`
        <html lang="en">
            <head>
                <title>${config.title}</title>
                <style>
                    table {
                        font-family: Arial, sans-serif;
                        border-collapse: collapse;
                        width: 50%;
                        margin: 20px auto;
                    }
                    th, td {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    .pagination {
                        margin-top: 20px;
                    }
                    .pagination a {
                        display: inline-block;
                        padding: 8px 16px;
                        text-decoration: none;
                        border: 1px solid #ddd;
                        margin: 0 4px;
                    }
                    .pagination a.active {
                        background-color: #4CAF50;
                        color: white;
                        border: 1px solid #4CAF50;
                    }
                    .container {
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>${config.title}<h2>
                    <table>
                        <tr>
                            <th>Rank</th>
                            <th>Address</th>
                            <th>NFTS</th>
                        </tr>
                        ${paginatedData
                            .map(
                                (item) => `
                            <tr>
                                <td>${item.rank}</td>
                                <td><a href="https://www.bithomp.com/explorer/${item.address}">${item.address}</a></td>
                                <td>${item.nfts}</td>
                            </tr>
                        `,
                            )
                            .join("")}
                    </table>
                    <div class="pagination">
                        ${Array.from({ length: totalPages }, (_, i) => {
                            const pageNum = i + 1;
                            const activeClass =
                                pageNum === page ? "active" : "";
                            return `<a href="?page=${pageNum}" class="${activeClass}">${pageNum}</a>`;
                        }).join("")}
                    </div>
                </div>
            </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
