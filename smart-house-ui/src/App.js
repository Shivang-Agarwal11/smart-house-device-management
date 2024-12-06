import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RegisterDevice from './pages/RegisterDevice';
import DeviceUsage from './pages/DeviceUsage';
import DeviceAnalytics from './pages/DeviceAnalytics';
import DeviceCommands from './pages/DeviceCommands';
import ProtectedRoute from './components/ProtectedRoute';
import AnalyticsReport from './pages/AnalyticsPage';
function App() {
    return (
        <Router>
            {/* <Navbar /> */}
            <div className="main-container">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/register-device"
                        element={
                            <ProtectedRoute>
                                <RegisterDevice />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/device-usage"
                        element={
                            <ProtectedRoute>
                                <DeviceUsage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/analytics/:deviceId" element={
                        <ProtectedRoute>
                            <AnalyticsReport/>
                        </ProtectedRoute>
                    } />

                    <Route
                        path="/device-analytics"
                        element={
                            <ProtectedRoute>
                                <DeviceAnalytics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/device-commands"
                        element={
                            <ProtectedRoute>
                                <DeviceCommands />
                            </ProtectedRoute>
                        }
                    />
                </Routes>

            </div>
        </Router>
    );
}

export default App;
