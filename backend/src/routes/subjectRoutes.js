const express = require('express');
const router = express.Router();
const {
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject
} = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getSubjects)
    .post(protect, authorize('INSTRUCTOR', 'ADMIN'), createSubject);

router.route('/:id')
    .get(protect, getSubjectById)
    .put(protect, authorize('INSTRUCTOR', 'ADMIN'), updateSubject)
    .delete(protect, authorize('INSTRUCTOR', 'ADMIN'), deleteSubject);

module.exports = router;
