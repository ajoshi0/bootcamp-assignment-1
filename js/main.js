/* Author: Arunesh Joshi */

var dataset = null;
var range = [0, 0];
var range_min, range_max;
var slider;

function populateSets ()
{
    var set, i, s;

    set = { };
    for (i in dataset) set[dataset[i].type] = true;
    s = $("#s_type").html(""); s.append($("<option>").val("All").text("All Types"));
    for (i in set) s.append($("<option>").val(i).text(i));

    set = { };
    for (i in dataset) set[dataset[i].brand] = true;
    s = $("#s_brand").html(""); s.append($("<option>").val("All").text("All Brands"));
    for (i in set) s.append($("<option>").val(i).text(i));

    range_min = null;
    range_max = null;

    for (i in dataset) {
        range_min = range_min === null ? dataset[i].size : Math.min (dataset[i].size, range_min);
        range_max = range_max === null ? dataset[i].size : Math.max (dataset[i].size, range_max);
    }
}

var dummyFunction = function()
{
};

var listProducts = function()
{
    var f_type = $("#s_type").val();
    var f_brand = $("#s_brand").val();
    var f_sort = $("#s_sort").val();

    var ui = $("#product-list").html("");
    var i, sfunc, n = 0;

    switch (f_sort)
    {
        case "price_asc":
            sfunc = function(a,b) { return parseFloat(a.listPrice) - parseFloat(b.listPrice); };
            break;

        case "price_desc":
            sfunc = function(a,b) { return parseFloat(b.listPrice) - parseFloat(a.listPrice); };
            break;

        case "ranking":
            sfunc = function(a,b) { return parseFloat(b.rating) - parseFloat(a.rating); };
            break;

        case "size":
            sfunc = function(a,b) { return parseFloat(b.size) - parseFloat(a.size); };
            break;
    }

    dataset.sort(sfunc);

    for (i in dataset)
    {
        var k = dataset[i];

        if (f_type != "All" && k.type != f_type) continue;
        if (f_brand != "All" && k.brand != f_brand) continue;

        if (!(range[0] <= parseInt(k.size) && parseInt(k.size) <= range[1]))
            continue;

        var div = $("<div>");

        $("<img>").attr("src", "images/blank.png").attr("data-original", k.image).appendTo(div);
        $("<b>").text(k.name.substr(0, 1+k.name.indexOf("\""))).appendTo(div);

        var j = k.name.substr(2+k.name.indexOf("\""));
        if (j.length > 28) j = j.substr(0, 28) + "...";
        $("<span>").text(j).appendTo(div);

        $("<em>").html(""+parseInt(k.listPrice)+"<span>"+ (k.listPrice - parseInt(k.listPrice)).toFixed(2).substr(1) +"</span>").appendTo(div);
        $("<i>").append($("<i>").css("width", ((k.rating/5)*100).toFixed(2) + "%")).appendTo(div);

        ui.append(div);
        n++;
    }

    ui.find("img").lazyload({ effect:"fadeIn", threshold:200 });
    $(window).trigger("scroll");

    $("#matches-label").text (n + " Matches");
}

function clearFilters ()
{
    var f = listProducts;
    listProducts = dummyFunction;

    $("#s_type").val("All").change();
    $("#s_brand").val("All").change();
    $("#s_sort").val("price_asc").change();
    slider.trigger("setvals", { values: [37, 55] } );

    listProducts = f;
    listProducts();
}

function popitup(url) {
    newwindow=window.open(url,'name','height=550,width=550');
    if (window.focus) {newwindow.focus()}
    return false;
}

function signUpMail (email)
{
    if (/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(email.val()))
        popitup("http://www.walmart.com/email_collect/thankyou_popup.gsp?conf_email="+encodeURI(email.val())+"&email_source_id=1178");
    else
        alert("Please specify a correct email address.");
}

function FocusOnInput()
{
    document.getElementById("searchbox").focus();
}

function search (term)
{
    if (/^[^&<>{}]*$/.test(term.val()))
        window.location = "http://www.walmart.com/search/search-ng.do?search_query="+encodeURI(term.val());
    else
        alert("Please remove incorrect characters from your search term.");
}

$(function()
{
    $.ajax ({ type: "get", async: false, url: "res/data.json", dataType: "json", success: function(result) { dataset = result; } });

    populateSets();

    $(".selectpicker").selectpicker();

    slider = $("#size-slider").slider({ animate: false, range: true, min: range_min, max: range_max, values: [37, 55],
        slide: function (event, ui) {

            if (ui.values[0] > ui.values[1])
                return false;

            $(this).find(".ui-slider-handle:eq(0)").attr("data-value", ui.values[0]);
            $(this).find(".ui-slider-handle:eq(1)").attr("data-value", ui.values[1]);

            range[0] = ui.values[0];
            range[1] = ui.values[1];

            if (ui.values.length == 2 || (ui.values.length == 3 && ui.values[2] != -1))
                listProducts();
        } });

    slider.bind("setvals", function (e, p) {
        $(this).slider("option", "values", p.values);
        $(this).slider("option", "slide").call($(this), null, p);
    });

    slider.trigger("setvals", { values: [37, 55, -1] } );
    listProducts();
});
