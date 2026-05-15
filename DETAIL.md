<p align="center">
  <img src="../Krishi%20Prabandh%20SwaSurvey%20App/logo/KRISHI_PRABANDH_LOGO.png" width="120" alt="Krishi Prabandh Logo" />
</p>

<h1 align="center">Web Portal: Deep Dive Architecture</h1>

<p align="center">
  <strong>Frontend Systems & Officer Dashboard Infrastructure</strong>
</p>

---

## 1. Application Architecture

The Krishi Prabandh Web Portal is a Single Page Application (SPA) built using React 18 and Vite. It is engineered for high performance, rapid re-renders, and complex state management handling real-time data streams from the backend.

### 1.1. Directory Structure

```text
frontend/
├── src/
│   ├── assets/              # Static icons, logos, and fonts
│   ├── components/          # Pure UI components (Buttons, Cards, Modals)
│   ├── context/             # Global State Providers (Auth, Language, Theme)
│   ├── hooks/               # Custom React Hooks (useFetch, usePolling)
│   ├── layouts/             # Dashboard wrappers, Sidebar, Topbar
│   ├── pages/               # Route-level components (Home, Applications, Map)
│   ├── services/            # Axios API client and interceptors
│   ├── styles/              # Global CSS, Tailwind configurations
│   ├── utils/               # Helper functions (Date formatting, String parsers)
│   ├── App.tsx              # Application Root
│   └── main.tsx             # DOM Mounting Point
```

---

## 2. State Management Strategy

To avoid "prop drilling" and maintain a clean architecture, the application eschews heavy libraries like Redux in favor of React's native Context API combined with custom hooks.

### 2.1. `AuthContext`
Manages the officer's session. It handles the mock login logic, stores JWTs (or simulated tokens) in `localStorage`, and provides protective wrappers (`<ProtectedRoute>`) around critical dashboard routes.

### 2.2. `LanguageContext`
Drives the multilingual interface. By maintaining an active locale state (e.g., `en` vs `mr`), the context dynamically feeds the appropriate JSON translation files to all child components, ensuring immediate, flicker-free language switching.

---

## 3. Polling and Real-Time Data

Given that officers need to see agricultural claims the moment they are submitted, the portal implements a robust polling mechanism.

```javascript
// Example implementation of the custom polling hook
function usePolling(endpoint, interval = 5000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await api.get(endpoint);
        if (isMounted) setData(response.data);
      } catch (err) {
        if (isMounted) setError(err);
      }
    };

    fetchData(); // Initial fetch
    const timer = setInterval(fetchData, interval); // Background poll
    
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [endpoint, interval]);

  return { data, error };
}
```

---

## 4. UI/UX Design System

The platform utilizes **TailwindCSS** for utility-first styling, ensuring consistency across the dashboard.

### 4.1. Design Principles
- **High Information Density:** Officers need to process a lot of data quickly. Tables are designed with tight padding, clear typography, and color-coded status badges.
- **Action-Oriented:** Every claim view has sticky "Approve" and "Reject" floating action buttons to reduce mouse travel.
- **Accessible Color Palette:** AI Confidence scores use an accessible traffic-light system (Red for low confidence/high fraud risk, Yellow for manual review, Green for verified).

---

## 5. Local Mock Server (FastAPI)

For local frontend development isolated from the Node.js core backend, a Python FastAPI server is included in `backend/`.

### 5.1. Why FastAPI?
It provides automatic interactive API documentation (`/docs` via Swagger UI) and allows frontend engineers to rapidly mock endpoints without needing a full Node.js environment setup.

### 5.2. Running the Mock
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn
uvicorn main:app --reload
```

---

## 6. Build and Deployment

Vite handles the build process, outputting highly optimized, minified static assets.

```bash
# Generate production build
npm run build

# Preview production build locally
npm run preview
```

The output in the `/dist` folder can be seamlessly deployed to Vercel, Netlify, or Firebase Hosting.
