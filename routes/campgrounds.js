const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// Get Campground Page List
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});

    res.render('campgrounds/index', { campgrounds });
}))

// Make New Campground Page 
// Frist GET the page, then POST a new page by redirecting
// Be careful that this GET should be placed before ":id" because "new" could be considered as ":id", which means it would not work normally
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);  // we're passing ".campground" b.c. of the input we get from the form in new.ejs --> campground[title] / campground[location]
    
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Get Individual Campground Page by id
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find that campground...');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

// Edit Campground Page
// Frist GET the page, then PUT the edited page by redirecting.
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Cannot find that campground...');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Delete Campground Page
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}))

module.exports = router;