# Whoomi - Web3 AI Character Platform

Whoomi is a Web3-based AI character platform that allows users to create and interact with their AI doppelgangers ('Dopples'). The platform combines Web3 technology with AI to create unique, personalized digital companions.

## Features

- Web3 wallet integration
- AI character creation and customization
- Real-time chat with AI characters
- Emotion analysis and response
- Character memory system
- Daily interaction limits
- Supabase database integration

## Tech Stack

- React (v18.3.1)
- TypeScript
- Next.js
- Tailwind CSS
- Shadcn UI
- Supabase
- Web3Modal
- Wagmi
- React Query
- Zustand

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whoomi.git
cd whoomi
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add the following environment variables:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # Reusable components
├── lib/                 # Utility functions and configurations
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 