$('#reloadBtn').click(function () {
    location.reload();
    //refresh the page
})

function iterateRecords() {

    dataTree = new Map()
    $('#compareBtn').click(function() {
        // change btn to refresh
        document.getElementById("compareBtn").style.display = "none";
        document.getElementById("refresh").style.display="block";


        window.open('show.html');
        // open the page show

    });

}

$(document).ready(function() {

    iterateRecords();

});