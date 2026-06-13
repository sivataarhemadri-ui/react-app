import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Mock data store
const users = new Map();
const tokens = new Map();
const donations = new Map();
const ngos = new Map();
const scratchCards = new Map();
let donationCounter = 0;
let ngoCounter = 0;

// Simple token generator
function generateToken() {
  return 'token_' + Math.random().toString(36).substr(2, 9);
}

function buildCertificateNumber(seq) {
  const year = new Date().getFullYear();
  const next = year + 1;
  const padded = String(seq).padStart(5, '0');
  return `FB-80G-${year}-${String(next).slice(-2)}-${padded}`;
}

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  const userId = 'user_' + Date.now();
  const user = { id: userId, email, name: name || 'User', role: role || 'donor', avatar_id: null };
  users.set(email, { ...user, password });
  
  const token = generateToken();
  tokens.set(token, userId);
  
  res.json({
    access_token: token,
    user: { ...user }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken();
  tokens.set(token, user.id);
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    access_token: token,
    user: userWithoutPassword
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = tokens.get(token);
  const user = Array.from(users.values()).find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    tokens.delete(token);
  }
  res.json({ ok: true });
});

app.patch('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = tokens.get(token);
  const user = Array.from(users.values()).find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  Object.assign(user, req.body);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Donation endpoints
app.post('/api/donations', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = tokens.get(token);
  const { food_name, quantity, food_type, food_condition, pickup_date_time, pickup_address, freshness, risk, shelf_life, image_name, image_url } = req.body;
  
  if (!food_name || !quantity || !pickup_date_time || !pickup_address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const parsedQuantity = parseInt(quantity, 10);
  const freshnessValue = freshness !== undefined ? freshness : Math.floor(Math.random() * 20) + 75;
  const riskValue = risk || (freshnessValue >= 85 ? 'Low' : freshnessValue >= 70 ? 'Medium' : 'High');
  const shelfLifeValue = shelf_life || (riskValue === 'Low' ? '6 hours' : riskValue === 'Medium' ? '4 hours' : '2 hours');
  
  donationCounter++;
  const donationId = `donation_${Date.now()}_${donationCounter}`;
  const certificateNo = buildCertificateNumber(donationCounter);
  const donation = {
    id: donationId,
    userId,
    food_name,
    quantity: parsedQuantity,
    food_type: food_type || 'Prepared meal',
    food_condition: food_condition || 'Fresh',
    pickup_date_time,
    pickup_address,
    freshness: freshnessValue,
    risk: riskValue,
    shelf_life: shelfLifeValue,
    image_name,
    image_url: image_url || null,
    status: 'approved',
    certificateNo,
    certificateIssuedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  donations.set(donationId, donation);
  const scratchCard = {
    id: `card_${donationId}`,
    userId,
    amount: Math.floor(Math.random() * 50) + 10,
    scratchPercentage: 0,
    revealedAmount: 0,
    status: 'active',
    brand: 'FoodBridge',
    label: 'Donation Reward',
    color: '#f97316',
    createdAt: new Date().toISOString(),
  };
  scratchCards.set(scratchCard.id, scratchCard);
  
  res.status(201).json({ 
    ...donation,
    message: 'Donation recorded successfully! You earned a new scratch card!',
    scratch_card: scratchCard,
    scratch_card_id: scratchCard.id,
    certificateNo,
  });
});

app.get('/api/donations', (req, res) => {

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = tokens.get(token);
  const userDonations = Array.from(donations.values()).filter(d => d.userId === userId);
  res.json({ donations: userDonations, total: userDonations.length });
});

app.get('/api/donations/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = tokens.get(token);
  const userDonations = Array.from(donations.values()).filter(d => d.userId === userId);
  res.json({ donations: userDonations, total: userDonations.length });
});

// NGO endpoints
app.get('/api/ngos', (req, res) => {
  const ngoList = Array.from(ngos.values());
  res.json({ ngos: ngoList });
});

app.post('/api/ngos', (req, res) => {
  const { name, address, contact } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'NGO name required' });
  }
  
  ngoCounter++;
  const ngoId = `ngo_${Date.now()}_${ngoCounter}`;
  const ngo = {
    id: ngoId,
    name,
    address: address || '',
    contact: contact || '',
    createdAt: new Date().toISOString()
  };
  
  ngos.set(ngoId, ngo);
  res.status(201).json(ngo);
});

// Scratch cards endpoints
app.post('/api/scratch-cards', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = tokens.get(token);
  const { amount } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: 'Amount required' });
  }
  
  const cardId = `card_${Date.now()}`;
  const card = {
    id: cardId,
    userId,
    amount: parseInt(amount),
    scratchPercentage: 0,
    revealedAmount: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  scratchCards.set(cardId, card);
  res.status(201).json(card);
});

app.get('/api/scratch-cards', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = tokens.get(token);
  const userCards = Array.from(scratchCards.values()).filter(c => c.userId === userId);
  res.json({ scratch_cards: userCards, scratchCards: userCards, total: userCards.length });
});

app.get('/api/scratch-cards/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = tokens.get(token);
  const userCards = Array.from(scratchCards.values()).filter(c => c.userId === userId);
  res.json({ scratch_cards: userCards, total: userCards.length });
});

app.post('/api/scratch-cards/:cardId/scratch', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { cardId } = req.params;
  const card = scratchCards.get(cardId);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }

  const code = `FB-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  card.scratchPercentage = 100;
  card.revealedAmount = card.amount;
  card.status = 'completed';
  card.scratched = true;

  res.json({ code, card });
});

app.patch('/api/scratch-cards/:cardId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { cardId } = req.params;
  const { scratchPercentage } = req.body;
  
  const card = scratchCards.get(cardId);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  
  if (scratchPercentage !== undefined) {
    card.scratchPercentage = Math.min(100, scratchPercentage);
    if (card.scratchPercentage >= 100) {
      card.revealedAmount = card.amount;
      card.status = 'completed';
      card.scratched = true;
    }
  }
  
  res.json(card);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
