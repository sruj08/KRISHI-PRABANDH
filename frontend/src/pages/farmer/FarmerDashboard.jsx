/**
 * Legacy entry: farmer UI is routed under /farmer/* via FarmerPortalLayout.
 * Kept so older imports or bookmarks resolve into the portal shell.
 */
import { Navigate } from 'react-router-dom';

export default function FarmerDashboard() {
  return <Navigate to="/farmer" replace />;
}
