# 💬 KampusChat

Aplikasi chat real-time eksklusif untuk mahasiswa dan alumni universitas dengan fitur messaging, group chat, dan user status management.

## 🎯 Fitur Utama

- ✅ **Real-time Messaging** - Chat instant dengan WebSocket
- ✅ **Authentication** - Login/Register dengan PIN verification
- ✅ **User Status** - Online/Offline status tracking
- ✅ **Group Chat** - Create dan manage group conversations
- ✅ **File Upload** - Share files dan images
- ✅ **Search** - Cari user dan chat history
- ✅ **Responsive UI** - Mobile-friendly dengan Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Lightning fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - High-quality UI components
- **React Query** - Server state management
- **WebSocket** - Real-time communication

### Backend
- **Express.js** - Node.js web framework
- **PostgreSQL** (Neon) - Database
- **Drizzle ORM** - Type-safe database layer
- **Session-based Auth** - User authentication
- **WebSocket** - Real-time updates

### Deployment
- **Replit** - Cloud hosting (optional)
- **Docker** - Containerization (optional)

---

## 📋 Prerequisites

- **Node.js** v18+ 
- **npm** atau **pnpm**
- **PostgreSQL** database (lokal atau cloud like Neon)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd KampusChat
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root folder:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require

# Session
SESSION_SECRET=your-random-secret-key-here

# Environment
NODE_ENV=development
PORT=5000
```

**Database Options:**
- **Neon** (Recommended): https://console.neon.tech
- **PostgreSQL Local**: Install PostgreSQL locally
- **Docker**: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

### 4. Setup Database

```bash
npm run db:push
```

Ini akan create semua tables sesuai schema di `shared/schema.ts`

### 5. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

---

## 📖 Available Scripts

```bash
# Development
npm run dev              # Start dev server dengan hot reload

# Production
npm run build           # Build frontend + backend
npm run start           # Run production server

# Database
npm run db:push         # Push schema ke database
npm run db:generate     # Generate TypeScript types

# Utility
npm run check           # TypeScript type checking
npm audit               # Check security vulnerabilities
npm audit fix           # Fix vulnerabilities
```

---

## 📁 Project Structure

```
KampusChat/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── chat/      # Chat-related components
│   │   │   └── ui/        # Shadcn UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities & helpers
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   └── index.html
│
├── server/                 # Backend Express app
│   ├── index.ts           # Express app setup
│   ├── routes.ts          # API routes
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── storage.ts         # File storage logic
│   └── vite.ts            # Vite dev middleware
│
├── shared/                 # Shared code
│   └── schema.ts          # Database schema (Drizzle)
│
├── uploads/               # Uploaded files storage
├── drizzle.config.ts      # Drizzle ORM config
├── vite.config.ts         # Vite config
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
└── package.json
```

---

## 🔐 Authentication Flow

1. **Register**: User create akun dengan username, email, NIM, dan PIN
2. **PIN Verification**: Sistem send PIN code untuk verification
3. **Login**: User login dengan username/email + password
4. **Session**: Session di-store di backend + cookies
5. **Protected Routes**: Route dilindungi dengan `ProtectedRoute` component

---

## 💾 Database Schema

### Tables Utama:
- **users** - User accounts & profiles
- **messages** - Chat messages
- **rooms** - Chat rooms/groups
- **room_members** - Room membership
- **user_statuses** - User online/offline status

Lihat detail di `shared/schema.ts`

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user profile

### Messages
- `GET /api/messages/:roomId` - Get messages
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Rooms
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

---

## 🔌 WebSocket Events

### Client → Server
- `connect` - User terhubung
- `send_message` - Send message
- `typing` - User sedang mengetik
- `change_status` - Update user status

### Server → Client
- `receive_message` - Terima message baru
- `user_typing` - User sedang mengetik
- `user_status_changed` - Status user berubah
- `disconnect` - User disconnect

---

## 🧪 Testing

### Manual Testing
1. Buka 2 browser tab dengan akun berbeda
2. Send message dari tab 1 → diterima real-time di tab 2
3. Test upload file, create group, dll

### Automated Testing
```bash
npm test
```

---

## 🐛 Troubleshooting

### `DATABASE_URL must be set`
**Solution**: Tambahkan `DATABASE_URL` di `.env` file

### `NODE_ENV is not recognized`
**Solution**: Gunakan `cross-env` (sudah di-install)

### Port 5000 sudah terpakai
**Solution**: Ubah `PORT` di `.env` atau kill process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### WebSocket connection failed
**Solution**: Pastikan backend berjalan di `http://localhost:5000`

---

## 📚 Dokumentasi Lengkap

Lihat file dokumentasi tambahan:
- `replit.md` - Setup untuk Replit platform
- `drizzle.config.ts` - Database configuration
- `vite.config.ts` - Vite configuration

---

## 🚢 Deployment

### Deploy ke Replit
1. Push ke GitHub
2. Import repository di Replit
3. Setup environment variables di Replit secrets
4. Run `npm start`

### Deploy ke Vercel/Netlify (Frontend Only)
1. Build: `npm run build`
2. Upload `dist/` folder

### Deploy ke Heroku/Railway (Full Stack)
1. Setup PostgreSQL
2. Set environment variables
3. Deploy dengan git push

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Tim Pengembang

- **Built with ❤️ for KampusChat Community**

---

## 📞 Support

Butuh bantuan? Hubungi:
- 📧 Email: support@kampuschat.com
- 💬 Chat: Buka issue di GitHub
- 📱 WhatsApp: [Link WhatsApp]

---

## 🎉 Happy Chatting!

Start connecting dengan kampus community Anda sekarang! 🚀
