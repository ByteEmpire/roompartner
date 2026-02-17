# 🏠 RoomPartner

A full-stack roommate finder platform that connects people looking for shared accommodation. Built with Next.js, NestJS, PostgreSQL, Socket.io, Cloudinary, and Razorpay.

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** - Secure signup, login, and token refresh
- 👤 **Profile Management** - Complete profile with photos, bio, and preferences
- 🔍 **Smart Matching** - Filter by city, budget, gender, occupation, food preference
- 💬 **Real-time Chat** - WebSocket-powered messaging with typing indicators and online status
- 📸 **Image Upload** - Profile and room images via Cloudinary
- 💳 **Subscription Plans** - Basic, Premium, Elite plans via Razorpay

### Subscription Features
| Feature | Free | Basic | Premium | Elite |
|---------|------|-------|---------|-------|
| Matches | 5 | 20 | 50 | 100 |
| Messaging | ✅ | ✅ | ✅ | ✅ |
| Verified Badge | ❌ | ✅ | ✅ | ✅ |
| Premium Badge | ❌ | ❌ | ✅ | ✅ |
| Elite Badge | ❌ | ❌ | ❌ | ✅ |
| Featured Search | ❌ | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (v4)
- **Zustand** (State Management)
- **Socket.io Client** (Real-time)
- **Axios** (HTTP Client)

### Backend
- **NestJS**
- **Prisma ORM**
- **PostgreSQL** (Supabase)
- **Socket.io** (WebSockets)
- **JWT** (Authentication)
- **Cloudinary** (Image Storage)
- **Razorpay** (Payments)

---

## 📁 Project Structure

```
roompartner/
├── frontend/                 # Next.js App
│   ├── app/
│   │   ├── (auth)/           # Login, Signup pages
│   │   ├── (protected)/      # Dashboard, Profile, Matches, Chat, Subscription
│   │   └── globals.css
│   ├── components/           # Reusable UI components
│   ├── store/                # Zustand state stores
│   ├── lib/                  # API client, socket service, utils
│   └── types/                # TypeScript types
│
└── backend/                  # NestJS API
    ├── src/
    │   ├── auth/             # Authentication module
    │   ├── users/            # Users module
    │   ├── profiles/         # Profiles module
    │   ├── matches/          # Matching module
    │   ├── chat/             # Chat module + WebSocket gateway
    │   ├── payments/         # Razorpay payments module
    │   ├── uploads/          # Cloudinary uploads module
    │   └── prisma/           # Prisma service
    └── prisma/
        └── schema.prisma     # Database schema
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- Cloudinary account
- Razorpay account

---

### Backend Setup

**1. Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/roompartner.git
cd roompartner/backend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create `.env` file:**
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/roompartner"
DIRECT_URL="postgresql://user:password@host:5432/roompartner"

# JWT
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_your_key"
RAZORPAY_KEY_SECRET="your-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**4. Run Prisma migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

**5. Start backend:**
```bash
npm run start:dev
```

Backend runs at: `http://localhost:3001`

---

### Frontend Setup

**1. Navigate to frontend:**
```bash
cd ../frontend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create `.env.local` file:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key"
```

**4. Start frontend:**
```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Settings → Upload → Upload Presets
3. Create two presets:
   - `roompartner_profile` (Unsigned, folder: `roompartner/profile`)
   - `roompartner_room` (Unsigned, folder: `roompartner/room`)

---

## 💳 Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Get Test API Keys from Dashboard
3. Add keys to both `.env` files
4. Use test card: `4111 1111 1111 1111` for payments

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profiles` | Create profile |
| GET | `/api/profiles/me` | Get my profile |
| PUT | `/api/profiles/me` | Update profile |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Get all matches (with filters) |
| GET | `/api/matches/score/:userId` | Get compatibility score |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/messages` | Send message |
| GET | `/api/chat/messages/:userId` | Get messages |
| GET | `/api/chat/conversations` | Get all conversations |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments/history` | Payment history |

---

## 🔌 WebSocket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `sendMessage` | `{ receiverId, content }` | Send a message |
| `typing` | `{ receiverId, isTyping }` | Typing indicator |
| `getAllOnlineUsers` | - | Get online users list |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `receiveMessage` | Message object | Incoming message |
| `messageSent` | Message object | Message sent confirmation |
| `userTyping` | `{ userId, isTyping }` | User typing status |
| `userOnline` | `{ userId }` | User came online |
| `userOffline` | `{ userId }` | User went offline |
| `onlineUsers` | `{ userIds }` | List of online users |

---

## 🌍 Environment Variables Reference

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_ACCESS_SECRET` | JWT access token secret | ✅ |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `RAZORPAY_KEY_ID` | Razorpay key ID | ✅ |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | ✅ |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | ✅ |

---

## 👨‍💻 Developer

**Shubhranshu** - Full Stack Developer

---

## 📝 License

This project is private and not open source.
