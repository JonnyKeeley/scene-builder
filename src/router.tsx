import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import SceneBuilder from '@/pages/SceneBuilder'
import Player from '@/pages/Player'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId',
    element: (
      <ProtectedRoute>
        <SceneBuilder />
      </ProtectedRoute>
    ),
  },
  {
    path: '/play/:projectId',
    element: <Player />,
  },
])
