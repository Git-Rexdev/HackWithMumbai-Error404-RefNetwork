const express = require('express');
const { sendMessage,getChatHistory,getMyChats,getAllChats} = require('../controllers/chatController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/send', auth, sendMessage);
router.get('/:userId', auth, getChatHistory);
router.get('/', auth, getMyChats);
router.get('/logs/all', auth, getAllChats);

module.exports = router;


// POST http://localhost:5000/api/chat/send
// Authorization: Bearer <STUDENT_JWT>
// Content-Type: application/json

// {
//   "receiverId": "<employeeId>",
//   "message": "Hello, I wanted to ask about the job requirements."
// }

// POST http://localhost:5000/api/chat/send
// Authorization: Bearer <EMPLOYEE_JWT>
// Content-Type: application/json

// {
//   "receiverId": "<studentId>",
//   "message": "Sure! You should focus on React basics and DSA."
// }