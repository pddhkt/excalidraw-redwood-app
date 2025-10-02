"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";

interface SessionInfo {
  userId?: string | null;
  createdAt?: string;
  expiresAt?: string;
  currentTime?: string;
  sessionDurationSeconds?: number;
  timeUntilExpirySeconds?: number;
  isExpired?: boolean;
  rememberMe?: boolean;
  expectedDuration?: string;
  error?: string;
}

export function SessionMonitor() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch session info
  const fetchSessionInfo = async () => {
    try {
      const response = await fetch('/debug/session');
      const data = await response.json();
      setSessionInfo(data);

      if (data.timeUntilExpirySeconds !== undefined) {
        setCountdown(data.timeUntilExpirySeconds);
      }
    } catch (error) {
      console.error('Failed to fetch session info:', error);
      setSessionInfo({ error: 'Failed to fetch session' });
    }
  };

  // Fake login handler
  const handleFakeLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/test/fake-login');
      const data = await response.json();

      if (data.success) {
        console.log('✅ Fake login successful:', data);
        await fetchSessionInfo();
      } else {
        console.error('❌ Fake login failed:', data);
      }
    } catch (error) {
      console.error('❌ Fake login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear session handler
  const handleClearSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/test/clear-session');
      const data = await response.json();

      if (data.success) {
        console.log('✅ Session cleared');
        setSessionInfo(null);
        setCountdown(null);
      }
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update countdown every second
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          return 0;
        }

        const newValue = prev - 1;
        console.log(`⏱️  Session expires in: ${newValue}s`);

        // If countdown reaches 0, session expired
        if (newValue === 0) {
          console.log('🔴 Session expired!');
          // Refresh session info to see expired state
          fetchSessionInfo();
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // Initial fetch on mount
  useEffect(() => {
    fetchSessionInfo();
  }, []);

  // Auto-refresh session info every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionInfo && !sessionInfo.error) {
        fetchSessionInfo();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionInfo]);

  const getStatusColor = () => {
    if (!sessionInfo || sessionInfo.error || !countdown) return 'bg-gray-500';
    if (countdown > 15) return 'bg-green-500';
    if (countdown > 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (!sessionInfo || sessionInfo.error) return 'No Session';
    if (sessionInfo.isExpired) return 'Expired';
    if (countdown === null) return 'Unknown';
    if (countdown > 15) return 'Active';
    if (countdown > 5) return 'Warning';
    return 'Critical';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Session Monitor</h1>
          <p className="text-gray-600 mb-8">
            Real-time session monitoring with countdown timer
          </p>

          {/* Status Badge */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`} />
              <span className="font-semibold text-lg">{getStatusText()}</span>
            </div>
            {countdown !== null && (
              <div className="text-4xl font-mono font-bold">
                {countdown}s
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex gap-4">
            <Button
              onClick={handleFakeLogin}
              disabled={isLoading}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Loading...' : '🔓 Fake Login'}
            </Button>
            <Button
              onClick={handleClearSession}
              disabled={isLoading}
              size="lg"
              variant="outline"
            >
              🗑️ Clear Session
            </Button>
            <Button
              onClick={fetchSessionInfo}
              disabled={isLoading}
              size="lg"
              variant="outline"
            >
              🔄 Refresh
            </Button>
          </div>

          {/* Session Info */}
          {sessionInfo && !sessionInfo.error && (
            <div className="bg-gray-100 rounded-lg p-6 font-mono text-sm">
              <h2 className="font-bold text-lg mb-4 font-sans">Session Information</h2>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">User ID:</div>
                  <div className="font-semibold">{sessionInfo.userId || 'None'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Created At:</div>
                  <div>{sessionInfo.createdAt ? new Date(sessionInfo.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Expires At:</div>
                  <div>{sessionInfo.expiresAt ? new Date(sessionInfo.expiresAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Current Time:</div>
                  <div>{sessionInfo.currentTime ? new Date(sessionInfo.currentTime).toLocaleString() : 'N/A'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Duration:</div>
                  <div>{sessionInfo.sessionDurationSeconds}s ({sessionInfo.expectedDuration})</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Time Until Expiry:</div>
                  <div className="font-bold text-lg">{sessionInfo.timeUntilExpirySeconds}s</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Is Expired:</div>
                  <div className={sessionInfo.isExpired ? 'text-red-600 font-bold' : 'text-green-600'}>
                    {sessionInfo.isExpired ? 'YES' : 'NO'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Remember Me:</div>
                  <div>{sessionInfo.rememberMe ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {sessionInfo?.error && (
            <div className="bg-red-100 text-red-700 rounded-lg p-6">
              <p className="font-semibold">Error:</p>
              <p>{sessionInfo.error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold mb-2">How to Test:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click "Fake Login" to create a session (30 second duration)</li>
              <li>Watch the countdown timer update every second</li>
              <li>Console logs show countdown: "⏱️ Session expires in: Xs"</li>
              <li>At 0s, session expires and page should redirect to /login</li>
              <li>Session extends automatically after 15s (halfway point) on activity</li>
            </ol>
          </div>

          {/* Test Scenarios */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-6">
            <h3 className="font-bold mb-2">Test Scenarios:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li><strong>5 seconds:</strong> Session should be active (green)</li>
              <li><strong>10 seconds:</strong> Session should be active (green)</li>
              <li><strong>15 seconds:</strong> Session reaches halfway point (yellow warning)</li>
              <li><strong>31 seconds:</strong> Session expires, redirect to /login</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}