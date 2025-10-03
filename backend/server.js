const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret_here'; // Change this to a strong secret in production

// MongoDB connection string from user
const MONGODB_URI = 'mongodb+srv://borgesdasilvaemanoelly13_db_user:lrxLkr8G8wRtHHkD@oiiii1.ftz9mxd.mongodb.net/?retryWrites=true&w=majority&appName=OIIII1';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.use(cors());
app.use(express.json());

// User schema and model
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Vehicle schema and model
const vehicleSchema = new mongoose.Schema({
    model: String,
    plate: String,
    year: Number,
    color: String,
    lastService: Date,
    nextService: Date,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Routes

// Register
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === 'admin@garagem.com';

    const user = new User({ name, email, password: hashedPassword, isAdmin });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
});

// Get current user info
app.get('/api/me', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

// Vehicles CRUD
app.get('/api/vehicles', authenticateToken, async (req, res) => {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    res.json(vehicles);
});

app.post('/api/vehicles', authenticateToken, async (req, res) => {
    const { model, plate, year, color, lastService, nextService } = req.body;
    const vehicle = new Vehicle({ model, plate, year, color, lastService, nextService, userId: req.user.id });
    await vehicle.save();
    res.status(201).json(vehicle);
});

app.delete('/api/vehicles/:id', authenticateToken, async (req, res) => {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
});

// Admin: get all users and their vehicles
app.get('/api/admin/clients', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.sendStatus(403);

    const users = await User.find({ email: { $ne: 'admin@garagem.com' } }).select('-password');
    const clients = [];

    for (const user of users) {
        const vehicles = await Vehicle.find({ userId: user._id });
        clients.push({ user, vehicles });
    }

    res.json(clients);
});

// Admin: export data
app.get('/api/admin/export', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.sendStatus(403);

    const users = await User.find().select('-password');
    const vehicles = await Vehicle.find();

    res.json({ users, vehicles });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
