import { Code2, ChevronDown, Plus, Check, ArrowLeft, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface HostSessionProps {
  onNavigate: (page: string) => void;
}

interface Topic {
  name: string;
  bgColor: string;
  textColor: string;
}

export default function HostSession({ onNavigate }: HostSessionProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Arrays']);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const userName = localStorage.getItem('userName') || 'Student';
  const userInitials = userName.substring(0, 2).toUpperCase();

  // --- NEW: PROFILE DROPDOWN STATE & LOGIC ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    onNavigate('login');
  };
  // -------------------------------------------

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const topics: Topic[] = [
    { name: 'Arrays', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    { name: 'Algorithms', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
    { name: 'Data Structures', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    { name: 'C++', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    { name: 'Java', bgColor: 'bg-red-100', textColor: 'text-red-700' },
    { name: 'Python', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    { name: 'Full-Stack', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    { name: 'MERN', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    { name: 'System Design', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
    { name: 'React', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    { name: 'Front-End', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    { name: 'Android', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  ];

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const timeOptions = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  const timeMap: Record<string, number> = {
    "09:00 AM": 9,
    "10:00 AM": 10,
    "11:00 AM": 11,
    "12:00 PM": 12,
    "01:00 PM": 13,
    "02:00 PM": 14,
    "03:00 PM": 15,
    "04:00 PM": 16,
    "05:00 PM": 17,
    "06:00 PM": 18
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const [year, month, day] = date.split('-');
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (selectedDate < today) {
      showToast("Oops! You cannot schedule a session in the past.", "error");
      return; 
    }

    const startNum = timeMap[startTime];
    const endNum = timeMap[endTime];

    if (startNum >= endNum) {
      showToast("Start time must be before end time.", "error");
      return; 
    }

    if (selectedDate.getTime() === today.getTime()) {
      const currentHour = new Date().getHours();
      if (startNum <= currentHour) {
        showToast("This time slot has already passed today.", "error");
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/slots/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: date,
          startTime: startTime,
          endTime: endTime,
          topics: selectedTopics
        })
      });

      if (response.ok) {
        setIsSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to create slot', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 text-white font-semibold animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* UPDATED NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center space-x-8">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-2 text-xl font-bold text-gray-900">Code-Pair</h1>
            </button>
          </div>

          <div className="flex items-center space-x-4">
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

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-[24px] shadow-2xl p-12 border border-gray-100">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-10">Host an Interview</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Start Time</label>
                  <div className="relative">
                    <select 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white cursor-pointer text-gray-700"
                    >
                      <option value="" disabled>Start Time</option>
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">End Time</label>
                  <div className="relative">
                    <select 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white cursor-pointer text-gray-700"
                    >
                      <option value="" disabled>End Time</option>
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Select Topics (Multiple Allowed)</label>
                <div className="flex flex-wrap gap-3">
                  {topics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.name);
                    return (
                      <button
                        key={topic.name}
                        type="button"
                        onClick={() => toggleTopic(topic.name)}
                        className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                          isSelected
                            ? `${topic.bgColor} ${topic.textColor} shadow-md`
                            : `${topic.bgColor} ${topic.textColor} opacity-60 hover:opacity-100`
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {topic.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedTopics.length === 0 || !date || !startTime || !endTime}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 text-lg mt-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Slot (+1 Credit) →
              </button>
            </form>
          </div>
        </div>
      </main>

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-8 text-center relative animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Slot Posted!</h3>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              Your availability has been added to the marketplace. You earned <span className="text-green-600 font-bold">+1 Credit!</span>
            </p>
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3.5 rounded-xl font-bold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}