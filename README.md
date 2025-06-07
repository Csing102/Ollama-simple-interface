# Ollama Chat Interface

This project is a simple chat interface built using HTML and a `server.js` backend. It provides a user-friendly interface for chatting and integrates server-side functionality to handle requests and responses.

## Features

- Basic chat interface using HTML.
- Server-side functionality using `server.js`.
- Easy-to-deploy and lightweight setup.

---

## Getting Started

Follow the steps below to set up and run the project locally.

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: Required to run the server. Download it from [Node.js Official Website](https://nodejs.org/).
- **npm (Node Package Manager)**: Comes bundled with Node.js.

---

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Csing102/ollama-chat-interface.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ollama-chat-interface
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

---

### Usage

#### Running the Server

Start the server by running the following command:
```bash
node server.js
```

The server will start on `http://localhost:3000` (default port). You can customize the port in the `server.js` file.

#### Accessing the Chat Interface

1. Open a web browser.
2. Go to `http://localhost:3000`.
3. You'll see the chat interface where you can interact with the application.

---

## File Structure

- **index.html**: The HTML file that defines the chat interface layout.
- **server.js**: The backend server handling requests and responses.
- **public/**: Contains static assets like CSS and JS (if applicable).
- **package.json**: Defines project dependencies and scripts.

---

## Customization

### Changing the Port
To change the default port:
1. Open the `server.js` file.
2. Modify the following line:
   ```javascript
   const PORT = 3000; // Change this to your desired port.
   ```

---

## Contributing

We welcome contributions to improve this project! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push the changes:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request with a detailed description of your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

If you encounter any issues or have questions, feel free to:
- Open an issue in the repository.
- Contact the project maintainer via email: `support@example.com`.

---

## Acknowledgments

Special thanks to the contributors and the community for their support!
Thanks to Huggingface, ChatGPT, and Github Copilot for the help!
