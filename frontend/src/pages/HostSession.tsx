import { Code2, Calendar, ChevronDown, Plus, Check, Bell, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

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
  // NEW STATE: For the Success Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Instead of immediately navigating, open the success modal!
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="ml-2 text-xl font-bold text-gray-900">Code-Pair</h1>
              </button>

              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
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
                  <span className="text-white font-semibold text-sm">SK</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 hidden md:block">Sanjay K</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-[24px] shadow-2xl p-12 border border-gray-100">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-10">Host an Interview</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Time</label>
                <div className="relative">
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white cursor-pointer text-gray-700"
                  >
                    <option value="" disabled selected>Choose a time slot</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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
                        {isSelected ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        {topic.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedTopics.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 text-lg mt-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Slot (+1 Credit) →
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* NEW: Success Modal Popup */}
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