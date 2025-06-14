// Colors scale (https://leonardocolor.io/scales.html#)
const colorScale = [
    '#2ecc71', '#58d68d', '#82e0aa', '#b2fab4', '#ffeaa7',
    '#f9c784', '#f5b041', '#eb984e', '#e74c3c', '#c0392b'
];

// Grabs all of the html items we will need to interact with
const minSlider = document.getElementById("minRank");
const maxSlider = document.getElementById("maxRank");
const rankLabelsContainer = document.getElementById("rankLabels");
const gradientBar = document.getElementById("gradientBar");
const tableBody = document.querySelector("#effectTable tbody");

// Will hold the csv data
let data = [];

// Creates the labels for the color gradient filter bar labels
function createRankLabels() {
    for (let i = 1; i <= 10; i++) {
        const span = document.createElement("span");
        span.textContent = i;
        span.style.color = colorScale[i - 1];
        rankLabelsContainer.appendChild(span);
    }
}

// Will be called to update the filters when a slider val is changed
function getSliderRange() {
    let min = parseInt(minSlider.value, 10);
    let max = parseInt(maxSlider.value, 10);

    // This makes sure if there is a big and someone can put the max slider below the min, it doesnt totally break
    return [Math.min(min, max), Math.max(min, max)];
}

// Will be called when a slider value is changed
function updateGradientBar() {

    // Should set the handle button for each slider to match the color bar. (doesn't seem to wrok on safari)
    const [min, max] = getSliderRange();
    minSlider.style.accentColor = colorScale[min - 1];
    maxSlider.style.accentColor = colorScale[max - 1];

    // Grabs the colors and makes them into a graident bar
    const steps = colorScale.slice(min - 1, max);
    gradientBar.style.background = `linear-gradient(to right, ${steps.join(', ')})`;

    // Sets the width of the gradient bar to match how far the handles are dragged (like a psuedo-progress bar)
    const percent = 100 / 9;
    gradientBar.style.left = `${(min - 1) * percent + 0.25}%`;
    gradientBar.style.width = `${(max - min) * percent - 0.2}%`;
}

// Inserts the data into table
function renderTable(filteredData) {

    //  clears table data
    tableBody.innerHTML = "";
    filteredData.forEach(row => {
        const tr = document.createElement("tr");

        // Matches the colorbar style for the freq rank
        tr.innerHTML = `
      <td style="background-color: ${colorScale[row.rank - 1]}">${row.rank}</td>
      <td>${row.effect}</td>
      <td>${row.count}</td>`;
        tableBody.appendChild(tr);
    });
}

// Updatse the table when it is filtered
function updateTable() {
    const [min, max] = getSliderRange();
    const filtered = data.filter(row => row.rank >= min && row.rank <= max);
    renderTable(filtered);
}

// Ran when a slider has input, helps keep a gap betwee min and max
function handleSliderInput() {
    let minVal = parseInt(minSlider.value, 10);
    let maxVal = parseInt(maxSlider.value, 10);
    if (minVal >= maxVal) minSlider.value = maxVal - 1;
    if (maxVal <= minVal) maxSlider.value = minVal + 1;
    updateGradientBar();
    updateTable();
}

// Loads in the data
fetch("data/side_effect_counts.csv")
    .then(res => res.text())
    .then(csv => {

        // Cleans
        const rows = csv.trim().split('\n').slice(1);

        // Keeps track of the three values in each row, rank and count as numbers
        data = rows.map(row => {
            const [rank, effect, count] = row.split(',');
            return {rank: +rank, effect, count: +count};

            // Sorts descending by rank
        }).sort((a, b) => b.rank - a.rank);

        // Runs all the prev. functions to make visual elements on page
        createRankLabels();
        updateGradientBar();
        renderTable(data);

        // Runs the function that holds the logic for slider changes whenever a slider is changes
        minSlider.addEventListener("input", handleSliderInput);
        maxSlider.addEventListener("input", handleSliderInput);

        // For every table header...
        document.querySelectorAll("th").forEach((th, i) => {

            // Every tim eyou click on one..
            th.addEventListener("click", () => {
                const key = ["rank", "effect", "count"][i];

                // Change the sort direction
                const direction = th.getAttribute("data-sort") === "asc" ? "desc" : "asc";

                // Clear all the previous sort icons
                document.querySelectorAll(".sort-icon").forEach(icon => icon.textContent = '');

                // Add the correct sort icon
                th.querySelector(".sort-icon").textContent = direction === "asc" ? '▲' : '▼';
                th.setAttribute("data-sort", direction);

                // Sort the data an drerender ir
                const sorted = [...data].sort((a, b) => {
                    return direction === "asc"
                        ? a[key] > b[key] ? 1 : -1
                        : a[key] < b[key] ? 1 : -1;
                });
                renderTable(sorted.filter(row => row.rank >= minSlider.value && row.rank <= maxSlider.value));
            });
        });
    });