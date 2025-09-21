# RefNetwork - AI-Powered Job Referral Portal

<div align="center">
  <img src="https://img.shields.io/badge/Event-HackWithMumbai%202025-blue" alt="HackWithMumbai 2025">
  <img src="https://img.shields.io/badge/Institution-BVUDET%20Navi%20Mumbai-green" alt="BVUDET Navi Mumbai">
  <img src="https://img.shields.io/badge/Team-Error%20404-red" alt="Team Error 404">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
</div>

## Overview

RefNetwork is a comprehensive job referral portal that leverages AI technology to enhance the job search and referral process. Built for HackWithMumbai 2025, this platform connects job seekers with employees who can provide referrals, while offering AI-powered tools for resume optimization and career guidance.

## Key Features

### Authentication & User Management

- **Multi-role System**: Fresher, Employee, and Admin roles
- **Secure Authentication**: JWT-based authentication with OTP verification
- **Profile Management**: Comprehensive user profiles with skill tracking

### Job Management

- **Job Posting**: Employees can post job opportunities
- **Job Discovery**: Advanced job search and filtering
- **Application Tracking**: Real-time application status updates
- **Referral System**: Seamless referral process for job applications

### AI-Powered Features

- **Resume Parser**: Extract and analyze resume content
- **Resume Analyzer**: AI-powered resume optimization suggestions
- **Keyword Analyzer**: Identify missing keywords for job applications
- **Roadmap Creator**: Generate personalized career development roadmaps
- **Smart Chatbot**: AI assistant for career guidance and support

### Communication

- **Real-time Chat**: Built-in messaging system
- **Notification System**: Email notifications for important updates
- **Admin Dashboard**: Comprehensive analytics and management tools

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components
- **React Router** for navigation
- **React Hook Form** with Zod validation

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email services
- **Multer** for file uploads

### AI Models

- **Python** with FastAPI
- **LangChain** for AI integration
- **OpenAI** API integration
- **SpaCy** for NLP processing
- **PDF processing** libraries

## Project Structure

```
RefNetwork/
├── Frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
├── Backend/                 # Node.js Express backend
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middlewares
│   └── utils/              # Utility functions
├── AI Models/              # Python AI services
│   ├── routes/             # FastAPI routes
│   └── services/           # AI service implementations
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/RefNetwork.git
   cd RefNetwork
   ```
2. **Backend Setup**

   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```
3. **Frontend Setup**

   ```bash
   cd Frontend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm start
   ```
4. **AI Models Setup**

   ```bash
   cd "AI Models"
   pip install -r requirements.txt
   python app.py
   ```

### Environment Variables

Create `.env` files in each directory with the following variables:

**Backend (.env)**

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

**Frontend (.env)**

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_API_URL=http://localhost:8000
```

**AI Models (.env)**

```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
```

## Usage

1. **Register** as a fresher or employee
2. **Verify** your account via OTP
3. **Complete** your profile with skills and experience
4. **Explore** job opportunities or post new ones
5. **Use AI tools** to optimize your resume and career path
6. **Apply** for jobs with referral support
7. **Chat** with the AI assistant for guidance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Team

**Team Error 404** - HackWithMumbai 2025

- **Institution**: BVUDET Navi Mumbai
- **Contact**: zanwarmanmohan@gmail.com
- **LinkedIn**: [www.linkedin.com/in/developer-manmohan](https://www.linkedin.com/in/developer-manmohan)

## Acknowledgments

- HackWithMumbai 2025 organizers
- BVUDET Navi Mumbai
- Open source community for amazing libraries and tools
- All contributors and supporters

## Support

For support, email zanwarmanmohan@gmail.com or create an issue in the repository.

---

<div align="center">
  <p>Made with ♥️ by Team Error 404 for HackWithMumbai 2025</p>
  <p>© 2025 Team Error 404. All rights reserved.</p>
</div>
