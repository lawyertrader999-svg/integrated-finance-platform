# 🏦 Integrated Finance Platform - แพลตฟอร์มการเงินครบวงจร

[![Deploy to GitHub Pages](https://github.com/lawyertrader999-svg/integrated-finance-platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/lawyertrader999-svg/integrated-finance-platform/actions/workflows/deploy.yml)

## 🌟 **Live Demo**
🔗 **[https://lawyertrader999-svg.github.io/integrated-finance-platform/](https://lawyertrader999-svg.github.io/integrated-finance-platform/)**

## 🎯 **ภาพรวมโปรเจกต์**

**Integrated Finance Platform** เป็นแพลตฟอร์มการเงินครบวงจรที่รวม 3 ระบบหลักเข้าด้วยกัน:

### 📊 **1. Portfolio Dashboard**
- **IC Dashboard**: สำหรับที่ปรึกษาการลงทุน (Investment Consultant)
- **Client Dashboard**: สำหรับลูกค้า
- **Advanced Analytics**: กราฟวิเคราะห์แบบโต้ตอบ
- **PowerPoint Generation**: สร้างงานนำเสนออัตโนมัติ

### 💰 **2. Personal Finance**
- **Income/Expense Tracking**: ติดตามรายรับ-รายจ่าย
- **Budget Management**: จัดการงบประมาณ
- **Category System**: หมวดหมู่ครบถ้วน
- **Monthly Reports**: รายงานรายเดือน

### 📈 **3. Trading Journal**
- **Trade Recording**: บันทึกการซื้อ-ขายหุ้น
- **P&L Tracking**: ติดตามกำไร-ขาดทุน
- **Performance Analytics**: วิเคราะห์ประสิทธิภาพ
- **Strategy Management**: จัดการกลยุทธ์การเทรด

## 🚀 **เทคโนโลยีที่ใช้**

- **Frontend**: React 19, Vite, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PowerPoint**: pptxgenjs
- **Deployment**: GitHub Pages

## 🔑 **ข้อมูลทดสอบ**

```
อีเมล: demo@example.com
รหัสผ่าน: password123
```

## 🛠️ **การติดตั้งและใช้งาน**

### **1. Clone Repository**
```bash
git clone https://github.com/lawyertrader999-svg/integrated-finance-platform.git
cd integrated-finance-platform
```

### **2. ติดตั้ง Dependencies**
```bash
# ใช้ pnpm (แนะนำ)
pnpm install

# หรือใช้ npm
npm install
```

### **3. ตั้งค่า Environment Variables**
```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **4. รันแอปพลิเคชัน**
```bash
# Development mode
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

## 🗄️ **การตั้งค่า Supabase Database**

### **สร้างตาราง:**
```sql
-- ตาราง clients
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
  initial_capital DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ตาราง portfolios
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  total_value DECIMAL(15,2) DEFAULT 0,
  total_return DECIMAL(15,2) DEFAULT 0,
  return_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ตาราง holdings
CREATE TABLE holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  average_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),
  market_value DECIMAL(15,2),
  gain_loss DECIMAL(15,2),
  gain_loss_percentage DECIMAL(5,2),
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เพิ่มตารางอื่นๆ สำหรับ Personal Finance และ Trading Journal
```

### **ตั้งค่า Row Level Security (RLS):**
```sql
-- เปิดใช้งาน RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

-- สร้าง Policies
CREATE POLICY "Enable read access for authenticated users" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users only" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 📱 **ฟีเจอร์หลัก**

### **🔐 Authentication System**
- ✅ User Registration/Login
- ✅ Role-based Access Control (IC/Client)
- ✅ Session Management
- ✅ Secure Password Handling

### **📊 Portfolio Management**
- ✅ Real-time Portfolio Tracking
- ✅ Asset Allocation Charts
- ✅ Performance Analytics
- ✅ Risk Assessment
- ✅ Market Comparison

### **💼 Client Management (IC)**
- ✅ Client Registration
- ✅ Portfolio Creation
- ✅ Risk Profiling
- ✅ Performance Reporting
- ✅ PowerPoint Generation

### **💰 Personal Finance**
- ✅ Income/Expense Tracking
- ✅ Budget Management
- ✅ Category Management
- ✅ Monthly Reports
- ✅ Financial Analytics

### **📈 Trading Journal**
- ✅ Trade Recording
- ✅ P&L Calculation
- ✅ Performance Statistics
- ✅ Strategy Analysis
- ✅ Win Rate Tracking

## 🎨 **UI/UX Features**

- ✅ **Responsive Design** - รองรับทุกอุปกรณ์
- ✅ **Thai Language Support** - ภาษาไทยครบถ้วน
- ✅ **Dark/Light Mode** - โหมดมืด/สว่าง
- ✅ **Interactive Charts** - กราฟแบบโต้ตอบ
- ✅ **Professional Styling** - ดีไซน์มืออาชีพ

## 🔒 **ความปลอดภัย**

- ✅ **Supabase Authentication** - ระบบยืนยันตัวตนที่ปลอดภัย
- ✅ **Row Level Security** - ความปลอดภัยระดับแถว
- ✅ **Input Validation** - ตรวจสอบข้อมูลนำเข้า
- ✅ **HTTPS Encryption** - การเข้ารหัสข้อมูล
- ✅ **Environment Variables** - ตัวแปรสภาพแวดล้อมที่ปลอดภัย

## 🚀 **การ Deploy**

### **GitHub Pages (อัตโนมัติ)**
- Push ไปยัง `main` branch
- GitHub Actions จะ build และ deploy อัตโนมัติ
- เข้าถึงได้ที่: `https://username.github.io/integrated-finance-platform/`

### **Vercel**
```bash
npm i -g vercel
vercel
```

### **Netlify**
```bash
npm run build
# Upload โฟลเดอร์ dist/ ไปยัง Netlify
```

## 📊 **ประสิทธิภาพ**

- ⚡ **Fast Loading** - โหลดเร็วด้วย Vite
- 📦 **Code Splitting** - แบ่งโค้ดเป็นส่วนๆ
- 🗜️ **Minification** - บีบอัดไฟล์
- 🔄 **Lazy Loading** - โหลดเมื่อต้องการ
- 💾 **Efficient Caching** - แคชข้อมูลอย่างมีประสิทธิภาพ

## 🤝 **การมีส่วนร่วม**

1. Fork โปรเจกต์
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 **License**

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file

## 📞 **การสนับสนุน**

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- 🐛 [Report Issues](https://github.com/lawyertrader999-svg/integrated-finance-platform/issues)
- 💬 [Discussions](https://github.com/lawyertrader999-svg/integrated-finance-platform/discussions)
- 📧 Email: support@example.com

## 🙏 **ขอบคุณ**

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Recharts](https://recharts.org/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Made with ❤️ for the Finance Community**
