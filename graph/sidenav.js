/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("chart").style.marginLeft = "250px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("chart").style.marginLeft = "0";
}

function toggleSelection() {
  var text = document.getElementById("toggle").innerHTML
  if (text == "Select All Topics"){
    document.getElementById("toggle").innerHTML = "Unselect All Topics"
    $('#checkboxes input').each(function() {
      $(this).prop("checked",true).change();
    });
  }
  else {
    document.getElementById("toggle").innerHTML = "Select All Topics"
    $('#checkboxes input').each(function() {
      $(this).prop("checked",false).change();
    });
  }
}
