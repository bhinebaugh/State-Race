// Load the handlebars templates via Ajax so that Ember can use them. 
// This way the templates stay organized in the filesystem, but they 
// still work without a webserver.
$('script[type="text/x-handlebars"]').each(function () {
    var $this = $(this);
    $.ajax({
        url: $(this).attr('data-src'),
        dataType: 'text',
        success: (function () {
            return function (data) {
                $this.html(data);
            };
        }())
    });
});