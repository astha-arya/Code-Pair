import { useState, useEffect, useRef } from 'react';
import { Code2, Bell, Wallet, UserPlus, Video, AlertTriangle, X, Loader2, Star, CheckCircle, LogOut } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [credits, setCredits] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(true);

  // User Identity
  const userName = localStorage.getItem('userName') || 'Student';
  const userId = localStorage.getItem('userId'); // Needed to check if user is host
  const userInitials = userName.substring(0, 2).toUpperCase();
  
  // Calculate Average Rating for US9 ---
  const myRatings = sessions.map(s => s.interviewer?._id === userId ? s.hostRating : s.studentRating).filter(r => r != null);
  const avgRating = myRatings.length > 0 ? (myRatings.reduce((a, b) => a + b, 0) / myRatings.length).toFixed(1) : "New";

  // Custom Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  
  // Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<any>(null);
  
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [sessionToRate, setSessionToRate] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    onNavigate('login');
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the menu is open, AND the click was NOT inside the menu...
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false); // Close it!
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto dismiss after 3 seconds
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch Actual Bookings
        const bookingsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/my-bookings`, { headers });
        const bookingsData = await bookingsRes.json();
        let allSessions = bookingsData.data || [];

        // 2. Fetch Unbooked Slots
        const slotsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/slots/my-slots`, { headers });
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          // Filter ONLY slots that are not booked yet
          const unbookedSlots = (slotsData.data || []).filter((slot: any) => !slot.isBooked);

          // Dress the slots up to look exactly like Booking objects for our UI
          const openSlotSessions = unbookedSlots.map((slot: any) => ({
            _id: slot._id, // Using the slot ID
            isOpenSlot: true, // A special flag so we know it's a raw slot!
            interviewer: { _id: userId, name: userName }, // I am the host
            interviewee: null, // Nobody has booked it yet
            slot: { _id: slot._id, date: slot.date, startTime: slot.startTime, endTime: slot.endTime },
            status: 'open', // New status for our badges
            topic: slot.topics ? slot.topics[0] : 'TBD'
          }));

          // Combine them!
          allSessions = [...allSessions, ...openSlotSessions];
        }

        // ── 3. FETCH REAL CREDITS (WITH CACHE-BUSTER) ──
        // The ?t=${Date.now()} forces Chrome to ask the database instead of lying to you
        const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me?t=${Date.now()}`, { headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCredits(profileData.data.credits); 
        }

        // Sort everything by date so the timeline looks correct
        allSessions.sort((a: any, b: any) => new Date(b.slot?.date).getTime() - new Date(a.slot?.date).getTime());
        setSessions(allSessions);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openCancelModal = (session: any) => {
    setSessionToCancel(session);
    setIsCancelModalOpen(true);
  };

  const handleCancel = async () => {
    if (!sessionToCancel) return;
    try {
      const token = localStorage.getItem('token');

      // --- NEW: IF IT IS AN UNBOOKED SLOT ---
      if (sessionToCancel.isOpenSlot) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/slots/${sessionToCancel._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          // Completely remove it from the screen
          setSessions(prev => prev.filter(s => s._id !== sessionToCancel._id));
          setIsCancelModalOpen(false);
          showToast("Unbooked slot removed successfully.", "success");
          setSessionToCancel(null);
        } else {
          showToast("Failed to remove slot.", "error");
        }
        return; // Stop here!
      }

      // --- OLD: IF IT IS A REAL BOOKING (Keep your existing logic below) ---
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/${sessionToCancel._id}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSessions(prev => prev.map(s => s._id === sessionToCancel._id ? { ...s, status: 'cancelled' } : s));
        setIsCancelModalOpen(false);
        const isHost = sessionToCancel.interviewer?._id === userId;
        if (!isHost) {
          setCredits(prev => prev + 1);
          showToast("Session cancelled and credit refunded.", "success");
        } else {
          showToast("Session cancelled successfully.", "success");
        }
        setSessionToCancel(null);
      } else {
        const err = await response.json();
        showToast(err.message || "Failed to cancel.", "error");
      }
    } catch (error) {
      showToast("Network error.", "error");
    }
  };

  const handleComplete = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/${sessionId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, status: 'completed' } : s));
        setCredits(prev => prev + 1);
        showToast("Session Completed! +1 Credit added.", "success");
      } else {
        const err = await response.json();
        showToast(err.message || "Failed to complete.", "error");
      }
    } catch (error) {
      showToast("Network error.", "error");
    }
  };

  const openRatingModal = (session: any) => {
    setSessionToRate(session);
    setRating(5);
    setFeedbackText("");
    setIsRatingModalOpen(true);
  };

  const handleRate = async () => {
    if (!sessionToRate) return;
    try {
      const token = localStorage.getItem('token');
      const isHost = sessionToRate.interviewer?._id === userId;
      
      const payload = {
        rating,
        feedback: isHost ? feedbackText : undefined
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/${sessionToRate._id}/rate`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Update the local session data so the Rate button hides immediately
        setSessions(prev => prev.map(s => {
          if (s._id === sessionToRate._id) {
            return isHost 
              ? { ...s, studentRating: rating, feedback: feedbackText }
              : { ...s, hostRating: rating };
          }
          return s;
        }));
        
        setIsRatingModalOpen(false);
        showToast("Thank you for your feedback!", "success");
      } else {
        const err = await response.json();
        showToast(err.message || "Failed to submit rating.", "error");
      }
    } catch (error) {
      showToast("Network error.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 text-white font-semibold animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Left Side: Logo & Navigation */}
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
              <button onClick={() => onNavigate('find-interviewer')} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Sessions
              </button>
            </div>
          </div>

          {/* Right Side: Rating & Profile */}
          <div className="flex items-center space-x-4">
            
            {/* The Sleek, Right-Aligned Rating Badge */}
            {myRatings.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 rounded-lg font-bold text-sm border border-amber-200 shadow-sm cursor-default">
                <Star className="w-4 h-4 fill-current text-amber-500" />
                <span className="text-amber-800">{avgRating}</span>
              </div>
            )}

            {/* CLICKABLE PROFILE WITH DROPDOWN */}
            <div className="relative border-l border-gray-200 pl-4" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">{userInitials}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 hidden md:block">{userName}</span>
              </button>

              {/* DROPDOWN MENU */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Wallet Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-[20px] shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <Wallet className="w-6 h-6 text-white mr-2" />
            <h2 className="text-white font-semibold text-lg">Wallet</h2>
          </div>
          <div className="text-6xl font-bold text-white mb-2">{credits}</div>
          <div className="text-xl font-semibold text-blue-100">CREDITS AVAILABLE</div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Find Interviewer */}
          <div className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all p-8 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-50 p-3 rounded-xl"><UserPlus className="w-7 h-7 text-blue-600" /></div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">Find Interviewer</h3>
                <p className="text-red-500 font-semibold text-sm">-1 Credit</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('find-interviewer')} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all duration-200"
            >
              Find Interviewer
            </button>
          </div>
          {/* Host Session */}
          <div className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all p-8 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-50 p-3 rounded-xl"><Video className="w-7 h-7 text-green-600" /></div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">Host Session</h3>
                <p className="text-green-600 font-semibold text-sm">+1 Credit</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('host-session')} 
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 rounded-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/30 active:scale-95 transition-all duration-200"
            >
              Host Session
            </button>
          </div>
        </div>

        {/* Session History */}
        <div className="bg-white rounded-[20px] shadow-md p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Session History</h3>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const isHost = session.interviewer?._id === userId;
                const hasRated = isHost ? session.studentRating != null : session.hostRating != null;

                return (
                  <div key={session._id} className={`flex flex-col p-5 rounded-xl transition-colors border ${session.status === 'cancelled' ? 'bg-gray-50 border-gray-200 opacity-60 grayscale' : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-sm font-semibold text-gray-600 w-32">
                          {session.slot?.date ? new Date(session.slot.date).toLocaleDateString('en-GB') : 'Date TBD'}<br/>
                          <span className="text-gray-900">{session.slot?.startTime ? `${session.slot.startTime} - ${session.slot.endTime}` : 'Time TBD'}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="font-bold text-gray-900 text-lg">Mock Interview ({session.topic || 'General'})</div>
                            {session.status === 'upcoming' && <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-md">Upcoming</span>}
                            {session.status === 'completed' && <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">Completed</span>}
                            {session.status === 'cancelled' && <span className="px-2.5 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-md">Cancelled</span>}
                            {session.status === 'open' && <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-md">Open Slot</span>}
                          </div>
                          <div className="text-sm text-gray-500 font-medium mt-1">
                            {session.isOpenSlot ? (
                              <span className="text-purple-600 font-semibold italic">Waiting for a student to book...</span>
                            ) : (
                              <>
                                {isHost ? 'Interviewing: ' : 'Hosted by: '}
                                <span className="text-gray-900">{isHost ? session.interviewee?.name : session.interviewer?.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* UPCOMING BUTTONS */}
                        {/* CANCEL BUTTON: Show for both Upcoming AND Open slots */}
                        {(session.status === 'upcoming' || session.status === 'open') && (
                          <button onClick={() => openCancelModal(session)} className="text-sm font-bold text-gray-500 hover:text-red-500 px-4 py-2 transition-colors">
                            Cancel
                          </button>
                        )}
                        
                        {/* COMPLETE BUTTON: Show ONLY for Upcoming slots IF user is the Host */}
                        {session.status === 'upcoming' && isHost && (
                          <button onClick={() => handleComplete(session._id)} className="bg-green-100 text-green-700 hover:bg-green-200 font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
                            Complete (+1)
                          </button>
                        )}
                        
                        {/* RATE BUTTON (Hides if already rated) */}
                        {session.status === 'completed' && !hasRated && (
                          <button onClick={() => openRatingModal(session)} className="flex items-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
                            <Star className="w-4 h-4 fill-current" /> Rate
                          </button>
                        )}

                        {session.status === 'cancelled' && (
                          <span className="text-sm text-gray-400 font-bold italic px-4">
                              {isHost ? 'Cancelled' : 'Credit Refunded'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Display Stars and Written Feedback */}
                    {(session.studentRating || session.hostRating || session.feedback) && (
                      <div className="mt-4 pt-4 border-t border-gray-100 w-full flex flex-col gap-2">
                        
                        {/* The Stars */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {isHost ? 'Rating Received' : 'Rating from Host'}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const ratingToShow = isHost ? session.hostRating : session.studentRating;
                              return (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${star <= (ratingToShow || 0) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* The Written Feedback */}
                        {session.feedback && (
                          <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                            {isHost ? 'You wrote: ' : 'Feedback: '} "{session.feedback}"
                          </p>
                        )}
                        
                      </div>
                    )}
                  </div>
                );
              })}
              {sessions.length === 0 && <div className="text-center py-8 text-gray-500 font-medium">No session history yet.</div>}
            </div>
          )}
        </div>
      </main>

      {/* CANCEL MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setIsCancelModalOpen(false)}></div>
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 relative z-10">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Cancel Interview?</h3>
            <p className="text-center text-gray-500 mb-8 font-medium">Are you sure you want to cancel? This time slot will be released.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsCancelModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold">Keep</button>
              <button onClick={handleCancel} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setIsRatingModalOpen(false)}></div>
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 relative z-10">
            <button onClick={() => setIsRatingModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Rate {sessionToRate?.interviewer?._id === userId ? 'Student' : 'Session'}</h3>
            <p className="text-center text-gray-500 mb-6 font-medium">How was the mock interview experience?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star className={`w-10 h-10 ${star <= (hoveredStar || rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>

            {/* IF USER IS HOST, SHOW WRITTEN FEEDBACK BOX */}
            {sessionToRate?.interviewer?._id === userId && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Written Feedback (Optional)</label>
                <textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Give the student some constructive feedback..."
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>
            )}

            <button 
              onClick={handleRate} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all duration-200"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}