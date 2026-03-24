import { useState, useEffect } from 'react';
import { Code2, Bell, Search, ChevronDown, CheckCircle, X, Loader2 } from 'lucide-react';

interface FindInterviewerProps {
  onNavigate: (page: string) => void;
}

interface Slot {
  _id: string;
  interviewer?: { _id: string; name: string; email?: string }; 
  date?: string;
  startTime?: string;
  endTime?: string;
  topics?: string[]; 
}

export default function FindInterviewer({ onNavigate }: FindInterviewerProps) {
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. NEW STATE: To hold the interview type required by the backend
  const [interviewTopic, setInterviewTopic] = useState('DSA');

  const userName = localStorage.getItem('userName') || 'Student';
  const userInitials = userName.substring(0, 2).toUpperCase();

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/slots/available`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.data || data || []); 
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const filteredSlots = filterTopic === 'All' 
    ? availableSlots 
    : availableSlots.filter(slot => slot.topics && slot.topics.includes(filterTopic));

  const handleBookClick = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
    setIsSuccess(false);
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return;
    try {
      const token = localStorage.getItem('token');
      // 2. FIXED: Sending both slotId AND topic to the backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          slotId: selectedSlot._id,
          topic: interviewTopic // Backend requires one of: DSA, Web, HR
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          onNavigate('dashboard');
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to book slot.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Network error occurred.");
    }
  };

  const getTopicStyle = (topicName: string) => {
    const styles: Record<string, string> = {
      'Arrays': 'bg-blue-100 text-blue-700',
      'Algorithms': 'bg-purple-100 text-purple-700',
      'Data Structures': 'bg-green-100 text-green-700',
      'C++': 'bg-blue-100 text-blue-700',
      'Java': 'bg-red-100 text-red-700',
      'Python': 'bg-blue-100 text-blue-700',
      'Full-Stack': 'bg-blue-100 text-blue-700',
      'MERN': 'bg-green-100 text-green-700',
      'System Design': 'bg-yellow-100 text-yellow-700',
      'React': 'bg-blue-100 text-blue-700',
      'Front-End': 'bg-blue-100 text-blue-700',
      'Android': 'bg-green-100 text-green-700',
    };
    return styles[topicName] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button onClick={() => onNavigate('dashboard')} className="flex items-center hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="ml-2 text-xl font-bold text-gray-900">Code-Pair</h1>
              </button>
              
              <div className="hidden md:flex items-center space-x-1">
                <button onClick={() => onNavigate('dashboard')} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  Dashboard
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-[20px] shadow-md p-6 mb-8 border border-gray-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="relative">
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="px-6 py-3 pl-4 pr-10 appearance-none rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700 bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">Filter by Topic (All)</option>
              <option value="Arrays">Arrays</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Data Structures">Data Structures</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="Full-Stack">Full-Stack</option>
              <option value="MERN">MERN</option>
              <option value="System Design">System Design</option>
              <option value="React">React</option>
              <option value="Front-End">Front-End</option>
              <option value="Android">Android</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSlots.map((slot) => {
              const hostName = slot.interviewer?.name || 'Unknown User';
              const hostInitials = hostName.substring(0, 2).toUpperCase();
              const safeTopics = slot.topics || []; 
              const formattedDate = slot.date ? new Date(slot.date).toLocaleDateString() : 'Date TBD';

              return (
                <div key={slot._id} className="bg-white rounded-[16px] shadow-md p-6 hover:shadow-lg transition-all border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">{hostInitials}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{hostName}</h3>
                      <div className="flex gap-2 mt-2">
                        {safeTopics.map((topic, idx) => (
                          <span key={idx} className={`px-3 py-1 ${getTopicStyle(topic)} text-xs font-semibold rounded-full`}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600 whitespace-nowrap">{formattedDate}</p>
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {slot.startTime || 'TBD'} - {slot.endTime || 'TBD'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleBookClick(slot)}
                      className="px-5 py-2.5 bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      Book (-1 Credit) →
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredSlots.length === 0 && (
              <div className="text-center py-10 text-gray-500 font-medium bg-white rounded-[16px] border border-gray-100">
                No slots currently available for this topic.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
            {!isSuccess ? (
              <>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition">
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Confirm Booking</h3>
                
                <p className="text-center text-gray-500 mb-6 font-medium leading-relaxed">
                  Book a mock interview with <span className="font-bold text-gray-900">{selectedSlot?.interviewer?.name || 'User'}</span> on <span className="text-gray-900">{selectedSlot?.date ? new Date(selectedSlot.date).toLocaleDateString() : ''} at {selectedSlot?.startTime}</span>?
                </p>

                {/* 3. NEW UI ELEMENT: Dropdown to select interview category required by backend */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-center">
                    Select Interview Category
                  </label>
                  <select 
                    value={interviewTopic}
                    onChange={(e) => setInterviewTopic(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold text-gray-700 bg-white"
                  >
                    <option value="DSA">DSA Interview</option>
                    <option value="Web">Web Development Interview</option>
                    <option value="HR">HR Interview</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2 text-center italic">Backend requires one of these three categories.</p>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmBooking} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30">
                    Confirm & Book (-1 Credit)
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-500 font-medium">Redirecting to your dashboard...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}