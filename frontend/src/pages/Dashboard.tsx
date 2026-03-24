import { useState, useEffect } from 'react';
import { Code2, Bell, Wallet, UserPlus, Video, AlertTriangle, X, Loader2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [credits, setCredits] = useState<number>(2); // Default fallback
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<any>(null);

  // Dynamic user details
  const userName = localStorage.getItem('userName') || 'Student';
  const userInitials = userName.substring(0, 2).toUpperCase();

  // 1. FETCH MY BOOKINGS AND CREDITS ON LOAD
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Bookings
        const bookingsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/my-bookings`, { headers });
        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          // Adjust according to how your teammate's API returns the array
          setSessions(bData.data || bData || []);
        }

        // Fetch User Credits (Using the creditRoutes endpoint your teammate built)
        const creditsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/credits/balance`, { headers });
        if (creditsRes.ok) {
          const cData = await creditsRes.json();
          // THE FIX: Add .data before .credits to look inside the nested object!
          setCredits(cData.data?.credits ?? 2);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openCancelModal = (session: any) => {
    setSessionToCancel(session);
    setIsModalOpen(true);
  };

  // 2. SEND CANCEL REQUEST TO BACKEND
  const handleCancel = async () => {
    if (!sessionToCancel) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/${sessionToCancel._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove from UI instantly (or you could mark it as 'cancelled')
        setSessions(sessions.filter((s) => s._id !== sessionToCancel._id));
        setIsModalOpen(false);
        setSessionToCancel(null);
        // Optimistically add the credit back
        setCredits(prev => prev + 1);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to cancel session.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error while canceling.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="ml-2 text-xl font-bold text-gray-900">Code-Pair</h1>
              </div>

              <div className="hidden md:flex items-center space-x-1">
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">
                  Dashboard
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  Sessions
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  Leaderboard
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{userInitials}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 hidden md:block">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-[20px] shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <Wallet className="w-6 h-6 text-white mr-2" />
            <h2 className="text-white font-semibold text-lg">Wallet</h2>
          </div>
          {/* Dynamic Credits */}
          <div className="text-6xl font-bold text-white mb-2">{credits}</div>
          <div className="text-xl font-semibold text-blue-100">CREDITS AVAILABLE</div>
          <p className="text-blue-200 text-sm mt-3 font-medium">1 Credit = 1 Mock Interview Booking</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all p-8 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <UserPlus className="w-7 h-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">Find Interviewer</h3>
                <p className="text-red-500 font-semibold text-sm">-1 Credit</p>
              </div>
            </div>
            <p className="text-gray-600 font-medium mb-6">Get matched with an interviewer for your mock interview session</p>
            <button
              onClick={() => onNavigate('find-interviewer')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20"
            >
              Find Interviewer
            </button>
          </div>

          <div className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all p-8 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <Video className="w-7 h-7 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">Host Session</h3>
                <p className="text-green-600 font-semibold text-sm">+1 Credit</p>
              </div>
            </div>
            <p className="text-gray-600 font-medium mb-6">Conduct mock interviews and earn credits to book your own sessions</p>
            <button
              onClick={() => onNavigate('host-session')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/20"
            >
              Host Session
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-md p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Sessions</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-sm font-semibold text-gray-600 w-32">
                      {/* Format date & time from backend */}
                      {session.slot?.date ? new Date(session.slot.date).toLocaleDateString() : 'Date TBD'}<br/>
                      <span className="text-gray-900">{session.slot?.time || 'Time TBD'}</span>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {session.status === 'scheduled' ? 'S' : 'C'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Mock Interview</div>
                      <div className="flex gap-2 mt-1">
                        {session.slot?.topics?.map((topic: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {session.status !== 'cancelled' && (
                      <button 
                        onClick={() => openCancelModal(session)}
                        className="text-sm font-semibold text-gray-500 hover:text-red-500 px-4 py-2 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
                      Join
                    </button>
                  </div>

                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-medium bg-gray-50 rounded-[16px]">
                  No upcoming sessions. Book or host one to get started!
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Cancellation Modal Pop-up */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Cancel Interview?</h3>
            <p className="text-center text-gray-500 mb-8 font-medium leading-relaxed">
              Are you sure you want to cancel this upcoming session? This time slot will be released for others to book.
            </p>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition-colors"
              >
                Keep Session
              </button>
              <button 
                onClick={handleCancel}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/30"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}