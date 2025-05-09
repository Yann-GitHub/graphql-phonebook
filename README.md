# GraphQL Phonebook Application

A full-stack address book application built with React, Apollo Client, GraphQL, and MongoDB.

## Features

- Complete contact management system
- Search contacts by name or phone number
- Mark contacts as favorites and filter by favorites
- User authentication and personalized contacts list
- Edit contact information with in-place editing
- GraphQL API with efficient data fetching

## Tech Stack

### Frontend

- React (Vite)
- Apollo Client for GraphQL queries
- Zustand for state management
- React Router for navigation
- Custom CSS with animations and responsive design

### Backend

- Node.js
- Apollo Server
- GraphQL
- MongoDB with Mongoose
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB installation or MongoDB Atlas account

### Installation

1. Clone the repository

```bash
git clone https://github.com/Yann-GitHub/graphql-phonebook.git
cd graphql-phonebook
```

2. Install backend dependencies

```bash
cd back
npm install
```

3. Install frontend dependencies

```bash
cd ../front
npm install
```

4. Configure environment variables
   - Create a `.env` file in the `back` directory with:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=4000
```

### Running the Application

1. Start the backend server

```bash
cd back
npm start
```

2. Start the frontend development server

```bash
cd front
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### User Authentication

- Register a new account
- Log in with your credentials
- Logged-in users can add contacts to their favorites list

### Managing Contacts

- View all contacts in the phonebook
- Search for contacts by name or phone number
- Filter to show only favorite contacts
- Click on a contact card to view detailed information
- Add contacts to your favorites with the toggle switch
- Edit phone numbers directly in the contact details view

## Project Structure

```
graphql-phonebook/
├── back/                   # Backend code
│   ├── models/             # Mongoose data models
│   ├── resolvers/          # GraphQL resolvers
│   ├── plugins/            # Apollo server plugins
│   ├── utils/              # Utility functions
│   └── server.js           # Server entry point
│
└── front/                  # Frontend code
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── queries.js      # GraphQL queries
    │   ├── store/          # Zustand state stores
    │   ├── utils/          # Utility functions
    │   ├── App.jsx         # Main App component
    │   └── main.jsx        # Entry point
    └── index.html          # HTML template
```

## Future Enhancements

- Add profile picture upload functionality
- Implement contact grouping and tagging
- Add dark mode theme
- Enable import/export of contacts
- Implement real-time updates with GraphQL subscriptions
- Implement dataloader for optimized data fetching
- Redis caching for improved performance
