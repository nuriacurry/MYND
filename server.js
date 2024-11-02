const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// In-memory database (replace with real database in production)
let users = [];
let jobs = [
    {
        id: 1,
        title: "Library Assistant",
        department: "Library",
        description: "Help students find resources and maintain library organization.",
        hours: "10-15 hours/week",
        wage: "$15/hour"
    }
];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/job-landing.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'job-landing.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/onboarding-portal.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'onboarding-portal.html'));
});

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Validate email domain
    if (!email.endsWith('@stu.bmcc.cuny.edu') && !email.endsWith('@admin.bmcc.cuny.edu')) {
        return res.status(400).json({ success: false, message: 'Invalid email domain' });
    }

    // Create new user
    const newUser = {
        id: users.length + 1,
        email,
        password,
        name,
        profile: {
            major: '',
            gpa: '',
            graduationYear: ''
        }
    };

    users.push(newUser);
    res.json({ success: true, message: 'Registration successful' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ 
            success: true, 
            userType: email.includes('admin') ? 'admin' : 'student',
            userId: user.id
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get user profile
app.get('/api/profile/:userId', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.userId));
    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// Update user profile
app.put('/api/profile/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...req.body };
        const { password, ...userWithoutPassword } = users[userIndex];
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});