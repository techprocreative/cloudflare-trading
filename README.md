# Signal Sage AI

[cloudflarebutton]

An AI-powered chat application that simulates trading analysis and signal generation in a visually rich FinTech dashboard.

Signal Sage AI is a sophisticated, visually stunning web application that demonstrates the power of AI in financial market analysis. It provides a simulated trading environment where users can interact with an AI assistant to get market insights and trading signals for currency pairs. The application features a dual-panel layout: a dynamic AI chat interface on one side, and a real-time data visualization dashboard on the other. The AI, powered by Cloudflare Workers and advanced language models, uses custom tools to generate plausible, mock market data and trading signals (e.g., BUY/SELL recommendations with confidence scores). The dashboard visualizes this data with elegant charts and summary cards, creating an immersive and educational FinTech experience.

## ✨ Key Features

*   **AI-Powered Analysis:** Interact with an AI assistant to get simulated market insights and trading signals.
*   **Dual-Panel Interface:** A responsive, resizable layout featuring an AI chat panel and a data visualization dashboard.
*   **Dynamic Data Visualization:** View mock real-time price charts and key performance indicators that react to AI-generated signals.
*   **Modern FinTech UI:** A beautiful, dark-themed interface designed for a professional and immersive user experience.
*   **Serverless Backend:** Built on the robust and scalable Cloudflare Workers platform.
*   **Advanced AI Tooling:** The AI leverages custom tools to generate realistic, on-the-fly mock market data.

## 🛠️ Technology Stack

*   **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
*   **State Management:** Zustand
*   **Animation:** Framer Motion
*   **Charts:** Recharts
*   **Backend:** Cloudflare Workers, Hono
*   **AI & Agents:** Cloudflare Agents SDK, OpenAI SDK

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/) package manager
*   A Cloudflare account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/signal_sage_ai.git
    cd signal_sage_ai
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**

    Create a `.dev.vars` file in the root of the project for local development. This file is used by Wrangler to load environment variables.

    ```ini
    # .dev.vars

    # Required: Your Cloudflare AI Gateway URL
    # Example: https://gateway.ai.cloudflare.com/v1/ACCOUNT_ID/GATEWAY_NAME/openai
    CF_AI_BASE_URL="your-cloudflare-ai-gateway-url"

    # Required: An API Key for your AI Gateway
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```

    You can get these credentials by setting up an [AI Gateway](https://developers.cloudflare.com/ai-gateway/) in your Cloudflare dashboard.

## 💻 Development

To start the development server, which runs both the Vite frontend and the Cloudflare Worker locally, run:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`. The frontend will automatically hot-reload on changes, and the worker will restart.

## 🚀 Deployment

This project is designed for seamless deployment to Cloudflare Pages.

1.  **Log in to Cloudflare:**
    ```bash
    bunx wrangler login
    ```

2.  **Deploy the application:**
    ```bash
    bun run deploy
    ```

    This command will build the Vite application, then deploy both the static assets and the worker function to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository with a single click.

[cloudflarebutton]

## ⚖️ Disclaimer

This application is for demonstration purposes only and is not connected to any real trading platform. The data generated is entirely simulated by an AI and should not be considered financial advice. All information, signals, and analysis are illustrative and do not represent real market conditions. Do not use this application for actual trading decisions.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.