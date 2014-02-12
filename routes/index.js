
/*
 * GET home page.
 */

//Import all schemas


exports.index = function(req, res){
    res.render('index', { title: 'Get Bookin\' - Badminton' });
};

exports.partials = function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};

exports.pages = function (req, res) {
    var name = req.params.name;
    res.render('pages/' + name);
};
