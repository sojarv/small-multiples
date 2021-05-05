//Load data and manipulate it

d3.csv("./Multiples.csv")
    .then(function(data) {

        // changes the string of This Year Sales to number
        data.forEach(d => {
            let num = d["This Year Sales"]
            num = num.substring(1);
            d["This Year Sales"] = +num
        })

        // groups by districts
        let groupsDistrict = d3.group(data, d => d.District)

        // groups by categories for the sums
        let category = d3.groups(data, d => d.Category)

        // get the sum of each category
        let sums = category.map(el => d3.sum(el[1], d => d['This Year Sales']))

        // sorts all categories based on sum of the sales
        let categorySums = d3.zip(category, sums).sort((a, b) => d3.ascending(a[1], b[1]))

        // sorted names of categories
        let names = categorySums.map(el => el[0][0])

        // first district
        let first = groupsDistrict.get('FD - 01')

        // creates names of rows for categories
        createRowNames(names)

        // for each district, creates svg based on sorted list
        groupsDistrict.forEach(element => {
            createSvg(element, names)
        });
    })

// creates a div for names, gives it id and append the names
const createRowNames = names => {
    let width = 150;
    let div = d3.select('#content')
        .append('div')
        .attr("width", width)
        .attr("height", "180")
        .attr('id', 'rowNames')

    names.forEach(el => {
        div.append('p').text(el)
    })
}

// creates svg for each district that is sorted based on the base of names array 
const createSvg = (element, names) => {
    // defines a width based on the max value of sales in each district and divides it by 5000 to get normal number
    let width = d3.max(element, d => d['This Year Sales']) / 5000

    // title of district
    let title = element[0]['District']

    // sorts the element based on the names array
    let sorted = element.sort(function(a, b) {
        return names.indexOf(a[['Category']]) - names.indexOf(b['Category']);
    });

    // creates a div that appends it to content
    const div = d3.select('#content')
        .append('div')
        .attr("width", width)
        .attr("height", "20")

    // append div a title of district
    div.append('p').text(title).attr('class', 'title')

    // create x axis and width of each graph is based on size of max element
    x = d3.scaleLinear()
        .domain([0, d3.max(sorted, d => d['This Year Sales'])])
        .range([0, width])

    // create y axis and based on categories and set height of 25 
    y = d3.scaleBand()
        .domain(sorted.map(d => d['Category']))
        .range([0, 25 * sorted.length])

    // append a svg to div
    const svg = div
        .append('svg')
        .attr("width", width)
        .attr("height", y.range()[1])

    // defines empty seection and joins it data with g and then it's translated for positioning
    const bar = svg.selectAll("g")
        .data(sorted)
        .join("g")
        .attr("transform", d => `translate(0,${y(d['Category'])})`)

    // append rectangle to each g, that is green and has right width and height is made the way that it has space between
    bar.append("rect")
        .attr("fill", "forestgreen")
        .attr("width", d => x(d["This Year Sales"]))
        .attr("height", y.bandwidth() - 5);
}